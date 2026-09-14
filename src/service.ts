/**
 * `SkillMcpService` — the process-local composition of skill and MCP
 * management. Skills are read straight off disk (host-level skill-filesystem
 * is disabled in web-app — presets own discovery — so `ctx.skills` has no
 * global layer to list); MCP servers are the `mcp-client` loader entries,
 * managed hot through `ctx.loader` and observed through a feature-detected
 * `ctx.mcpStatus` seam with a derived fallback.
 */
import { Service, type Context, type FiberState } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import type {} from '@deepseek-ai/dsh-tools'
import { existsSync } from 'node:fs'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSkillFrontmatter, setDisableModelInvocation } from './frontmatter.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** The skill/MCP center engine (provided by this package's host half). */
    skillMcp: SkillMcpService
  }
}

/** Runtime mirror of cordis FiberState (a cross-package const enum). */
const FIBER_PHASE: Record<FiberState, string | null> = {
  0: 'pending',
  1: 'loading',
  2: 'active',
  3: 'failed',
  4: null,
  5: 'unloading',
}

/** One skill as the Settings surface exposes it. */
export interface SkillView {
  name: string
  description: string
  source: string
  provider: string
  modelInvocable: boolean
  userInvocable: boolean
  /** Always true — user-level skills are disk-backed and toggleable. */
  writable: boolean
  /** Absolute SKILL.md path (the toggle target; opaque to the client display). */
  path: string
}

/** Plugin configuration for the skill/MCP engine. */
export interface SkillConfig {
  /** Additional read-only official/bundled skill roots (e.g. the harness repo's own `.agents/skills`). */
  officialSkillDirs?: string[]
}

/** One MCP server as the Settings surface exposes it. */
export interface McpServer {
  id: string
  serverName: string
  transport: 'stdio' | 'streamable-http'
  command?: string
  args?: string[]
  cwd?: string
  url?: string
  headers?: Record<string, string>
  disabled: boolean
  fiberPhase: string | null
}

/** One tool a server contributes, as the management surface lists it. */
export interface McpToolView {
  name: string
  description: string
}

/** Runtime status of one MCP server (sidebar polling). */
export interface McpServerStatus {
  serverName: string
  fiberPhase: string | null
  toolCount: number
  /**
   * The tools themselves. A bare count says nothing about what the server
   * actually offers, so the surface lists names and descriptions too
   * (2026-09-14 用户：MCP 的 tools 信息太少了，最好有名称和介绍）。
   * Names come from `tools.schemas()`, which whitelists name/description.
   */
  tools: McpToolView[]
  connected: boolean
  statusSource: 'seam' | 'derived'
}

/** Client-supplied MCP server config, normalized to the mcp-client shape. */
export interface McpConfig {
  serverName: string
  transport: 'stdio' | 'streamable-http'
  command?: string
  args?: string[]
  cwd?: string
  url?: string
  headers?: Record<string, string>
}

/** Normalize a client MCP config into the full mcp-client config (defaults filled). */
function fullMcpConfig(input: McpConfig): Record<string, unknown> {
  if (input.transport === 'stdio') {
    return {
      transport: 'stdio',
      serverName: input.serverName,
      command: input.command ?? '',
      args: input.args ?? [],
      env: {},
      cwd: input.cwd ?? '',
      toolCallTimeoutMs: 60_000,
      failOnStartupError: false,
    }
  }
  return {
    transport: 'streamable-http',
    serverName: input.serverName,
    url: input.url ?? '',
    headers: input.headers ?? {},
    toolCallTimeoutMs: 60_000,
    failOnStartupError: false,
  }
}

/** User-level skill roots (host-level filesystem discovery is preset-owned in web). */
const SKILL_ROOTS: readonly { path: string; source: string }[] = [
  { path: join(homedir(), '.dsh', 'skills'), source: 'user-dsh' },
  { path: join(homedir(), '.agents', 'skills'), source: 'user-agents' },
]

/**
 * This package's own `node_modules` directory — the tree every loaded plugin
 * was resolved from.
 *
 * Derived from the module URL instead of assuming
 * `$DSH_HOME/profiles/<p>/node_modules`: the profile layout and even the
 * directory name vary, while this module is always inside that tree.
 * @returns the node_modules path, or null when the module is not under one.
 */
function ownNodeModules(): string | null {
  const here = fileURLToPath(import.meta.url)
  const marker = `${sep}node_modules${sep}`
  const at = here.lastIndexOf(marker)
  return at < 0 ? null : here.slice(0, at + marker.length - 1)
}

/** Absolute SKILL.md path for one directory/file entry, or null. */
function skillPathFor(root: string, name: string, isDirectory: boolean): string | null {
  if (isDirectory) return join(root, name, 'SKILL.md')
  if (name.endsWith('.md')) return join(root, name)
  return null
}

/** Scan one root for SKILL.md entries and parse their frontmatter. */
async function scanSkillRoot(root: string, source: string, writable = true, provider = 'filesystem'): Promise<SkillView[]> {
  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return [] // root absent
  }
  const skills: SkillView[] = []
  for (const entry of entries) {
    const skillPath = skillPathFor(root, entry.name, entry.isDirectory())
    if (skillPath === null) continue
    let text
    try {
      text = await readFile(skillPath, 'utf8')
    } catch {
      continue
    }
    const fm = parseSkillFrontmatter(text)
    if (fm === null) continue
    skills.push({
      name: fm.name,
      description: fm.description,
      source,
      provider,
      modelInvocable: fm.modelInvocable,
      userInvocable: true,
      writable,
      path: skillPath,
    })
  }
  return skills
}

export class SkillMcpService extends Service {
  static inject = ['loader', 'tools']

  private readonly officialSkillDirs: readonly string[]

  constructor(ctx: Context, config: SkillConfig = {}) {
    super(ctx, 'skillMcp')
    this.officialSkillDirs = config.officialSkillDirs ?? []
  }

  /**
   * Skill roots that live **inside loaded plugin packages**, i.e.
   * `<node_modules>/<pkg>/skills`.
   *
   * The host-level skill filesystem is disabled in web-app (presets own
   * discovery), so a plugin that ships skills — `@max-null/dsh-skills` and
   * `@max-null/dsh-plugin-center` both do — keeps them on disk inside its own
   * package, where no user-level root can see them. Without this the
   * management surface showed 17 user skills while 8 plugin skills were loaded
   * and in effect (2026-09-14 用户报「skill 生效但不展示」).
   *
   * Only **loaded** entries are probed, so this costs one existence check per
   * plugin rather than a scan of the whole node_modules tree.
   */
  private pluginSkillDirs(): { dir: string; label: string }[] {
    const nm = ownNodeModules()
    if (nm === null) return []
    const out: { dir: string; label: string }[] = []
    for (const entry of this.ctx.loader.entries()) {
      const name = entry.options.name
      if (typeof name !== 'string' || name === '' || name.startsWith('.') || name.startsWith('/')) continue
      const dir = join(nm, ...name.split('/'), 'skills')
      if (existsSync(dir)) out.push({ dir, label: `plugin:${name}` })
    }
    return out
  }

  /**
   * User-level skills, project-level skills for the given workspace, skills
   * bundled inside loaded plugin packages, and any configured official roots.
   */
  async listSkills(cwd?: string): Promise<SkillView[]> {
    const skills: SkillView[] = []
    for (const root of SKILL_ROOTS) {
      skills.push(...await scanSkillRoot(root.path, root.source))
    }
    if (cwd !== undefined && cwd !== '') {
      skills.push(...await scanSkillRoot(join(cwd, '.agents', 'skills'), 'project-agents'))
      skills.push(...await scanSkillRoot(join(cwd, '.dsh', 'skills'), 'project-dsh'))
    }
    for (const plugin of this.pluginSkillDirs()) {
      skills.push(...await scanSkillRoot(plugin.dir, plugin.label, false, 'plugin'))
    }
    for (const dir of this.officialSkillDirs) {
      skills.push(...await scanSkillRoot(dir, 'bundled', false, 'dsh-official'))
    }
    return skills
  }

  /** Flip one disk-backed skill's model invocation by rewriting its SKILL.md frontmatter. */
  async toggleSkill(path: string): Promise<SkillView> {
    let text
    try {
      text = await readFile(path, 'utf8')
    } catch {
      throw new Error('skill-not-found')
    }
    const fm = parseSkillFrontmatter(text)
    if (fm === null) throw new Error('skill-not-found')
    // Currently model-invocable → disable.
    await writeFile(path, setDisableModelInvocation(text, fm.modelInvocable), 'utf8')
    return {
      name: fm.name,
      description: fm.description,
      source: 'user',
      provider: 'filesystem',
      modelInvocable: !fm.modelInvocable,
      userInvocable: true,
      writable: true,
      path,
    }
  }

  /**
   * Read one skill's SKILL.md raw text for display. Paths must live under a
   * known skill root — a plain path join against the same roots `listSkills`
   * scans, so the RPC cannot be used to read arbitrary files.
   */
  async readSkill(path: string, cwd?: string): Promise<string> {
    const roots = [...SKILL_ROOTS.map(root => root.path)]
    if (cwd !== undefined && cwd !== '') {
      roots.push(join(cwd, '.agents', 'skills'), join(cwd, '.dsh', 'skills'))
    }
    for (const plugin of this.pluginSkillDirs()) roots.push(plugin.dir)
    roots.push(...this.officialSkillDirs)
    // Segment-boundary prefix check: a sibling directory like `skills-notes`
    // must not satisfy a `skills` root. join(root, '') normalizes to root.
    if (!roots.some(root => path === root || path.startsWith(`${root}${sep}`))) throw new Error('skill-not-found')
    let text
    try {
      text = await readFile(path, 'utf8')
    } catch {
      throw new Error('skill-not-found')
    }
    return text
  }

  /** Every `mcp-client` loader entry as a server card. */
  async listMcpServers(): Promise<McpServer[]> {
    const servers: McpServer[] = []
    for (const entry of this.ctx.loader.entries()) {
      // The official bridge's specifier is the package name, not its internal
      // plugin `name` ('mcp-client'); one entry = one MCP server.
      if (entry.options.name !== '@deepseek-ai/dsh-mcp-client') continue
      const cfg = entry.options.config as Partial<McpConfig> | undefined
      servers.push({
        id: entry.id,
        serverName: cfg?.serverName ?? entry.id,
        transport: cfg?.transport === 'streamable-http' ? 'streamable-http' : 'stdio',
        command: cfg?.command,
        args: cfg?.args,
        cwd: cfg?.cwd,
        url: cfg?.url,
        headers: cfg?.headers,
        disabled: entry.disabled,
        fiberPhase: entry.fiber === undefined ? null : FIBER_PHASE[entry.fiber.state],
      })
    }
    return servers
  }

  /** Add one mcp-client entry — hot-connects (create → init) and persists. */
  async createMcpServer(config: McpConfig): Promise<{ id: string }> {
    const id = `mcp-${config.serverName}`
    // loader.create's runtime ensureId honors an explicit id (cordis.yml rows
    // all carry one), but its d.ts Omit<EntryOptions,'id'> hides that — assert.
    await this.ctx.loader.create({ id, name: '@deepseek-ai/dsh-mcp-client', config: fullMcpConfig(config) } as never)
    return { id }
  }

  /** Rewrite one server's config — hot-updates the running fiber. */
  async updateMcpServer(id: string, config: McpConfig): Promise<void> {
    await this.ctx.loader.update(id, { config: fullMcpConfig(config) })
  }

  /** Remove one server — disconnects and unregisters its tools. */
  async removeMcpServer(id: string): Promise<void> {
    await this.ctx.loader.remove(id)
  }

  /** Enable/disable one server without deleting its config. */
  async setMcpServerEnabled(id: string, enabled: boolean): Promise<void> {
    await this.ctx.loader.update(id, { disabled: enabled ? null : true })
  }

  /** Runtime status per server: upstream `mcpStatus` seam when present, else derived. */
  async mcpStatus(): Promise<McpServerStatus[]> {
    const servers = await this.listMcpServers()
    // Tool identity always comes from the mounted tool table — `schemas()`
    // whitelists name/description, which is exactly what the surface needs.
    // The seam, when present, only refines the count and connection facts.
    const schemas = this.ctx.tools.schemas()
    const toolsOf = (serverName: string): McpToolView[] => {
      const prefix = `mcp__${serverName}__`
      return schemas
        .filter(s => s.name.startsWith(prefix))
        .map(s => ({ name: s.name, description: s.description ?? '' }))
    }
    const seam = (this.ctx as Context).get(
      'mcpStatus',
    ) as { list(): { serverName: string; phase: string; toolCount: number }[] } | undefined
    if (seam !== undefined) {
      const byName = new Map(seam.list().map(s => [s.serverName, s]))
      return servers.map(s => {
        const st = byName.get(s.serverName)
        const tools = toolsOf(s.serverName)
        return {
          serverName: s.serverName,
          fiberPhase: s.fiberPhase,
          toolCount: st?.toolCount ?? tools.length,
          tools,
          connected: st?.phase === 'connected',
          statusSource: 'seam',
        }
      })
    }
    return servers.map(s => {
      const tools = toolsOf(s.serverName)
      return {
        serverName: s.serverName,
        fiberPhase: s.fiberPhase,
        toolCount: tools.length,
        tools,
        connected: !s.disabled && s.fiberPhase === 'active' && tools.length > 0,
        statusSource: 'derived',
      }
    })
  }
}

export default SkillMcpService
