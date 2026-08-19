/**
 * dsh-skill-mcp-center browser half. Components live in the apply closure to
 * reach the loopback RPC seam. Styles live in one injected <style> sheet
 * (so :hover/:focus work) and use var(--dsw-*) tokens only.
 */
import { useCallback, useEffect, useState } from 'react'
import type {} from 'dsh-better-sidebar'
import type {} from '@deepseek-ai/dsh-client-locale'

// ---- injected stylesheet (single sheet, :hover/:focus live here) ----
const CSS = `
.smc-title { font-size: 18px; font-weight: 600; line-height: 26px; color: var(--dsw-alias-label-primary); }
.smc-sub { font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-tertiary); }
.smc-tabs { display: flex; gap: 4px; margin: 16px 0 12px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
.smc-tab { padding: 8px 14px; font-size: 14px; cursor: pointer; background: none; border: none; font-family: inherit; color: var(--dsw-alias-label-tertiary); border-bottom: 2px solid transparent; margin-bottom: -1px; }
.smc-tab:hover { color: var(--dsw-alias-label-secondary); }
.smc-tab.active { color: var(--dsw-alias-label-primary); border-bottom-color: var(--dsw-alias-state-business-primary); }

.smc-card { border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; background: var(--dsw-alias-bg-layer-1); min-width: 0; }
.smc-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.smc-name { font-weight: 600; color: var(--dsw-alias-label-primary); }
.smc-desc { color: var(--dsw-alias-label-secondary); font-size: 13px; margin-top: 4px; }
.smc-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.smc-spacer { flex: 1; }

.smc-badge { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: 6px; font-size: 12px; line-height: 1; background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-secondary); }
.smc-badge.user { background: var(--dsw-alias-state-business-tertiary); color: var(--dsw-alias-state-business-primary); }
.smc-badge.workspace { background: var(--dsw-alias-state-success-tertiary); color: var(--dsw-alias-state-success-primary); }
.smc-badge.bundled { background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-tertiary); }
.smc-badge.runtime { background: var(--dsw-alias-state-warn-tertiary); color: var(--dsw-alias-state-warn-primary); }
.smc-badge.disabled { background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-caption); }

.smc-btn { height: 26px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-primary); font-size: 12px; cursor: pointer; font-family: inherit; }
.smc-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }
.smc-btn.primary { border: none; background: var(--dsw-alias-button-primary-fill); color: var(--dsw-alias-bg-base); }
.smc-btn.primary:hover { background: var(--dsw-alias-button-primary-hover); }
.smc-btn.danger { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); background: none; }
.smc-btn.danger:hover { background: var(--dsw-alias-interactive-bg-hover); }
.smc-btn:disabled { opacity: 0.45; cursor: default; }

.smc-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-state-success-primary); }
.smc-dot.idle { background: var(--dsw-alias-label-caption); }
.smc-dot.failed { background: var(--dsw-alias-state-error-primary); }

.smc-toggle { position: relative; width: 34px; height: 20px; border-radius: 10px; border: none; cursor: pointer; background: var(--dsw-alias-bg-module-platform); transition: background .15s; }
.smc-toggle.on { background: var(--dsw-alias-state-success-primary); }
.smc-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-bg-base); transition: left .15s; }
.smc-toggle.on::after { left: 16px; }
.smc-toggle:disabled { opacity: 0.4; cursor: default; }

.smc-input { height: 28px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font-size: 13px; outline: none; font-family: inherit; }
.smc-input:focus { border-color: var(--dsw-alias-state-business-primary); }
.smc-select { height: 28px; padding: 0 8px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); font-size: 13px; cursor: pointer; font-family: inherit; }
.smc-form { border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; padding: 16px; margin-bottom: 14px; background: var(--dsw-alias-bg-layer-2); }
.smc-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.smc-label { font-size: 12px; color: var(--dsw-alias-label-tertiary); }
.smc-error { font-size: 12px; color: var(--dsw-alias-state-error-primary); }

.smc-toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); padding: 10px 18px; border-radius: 10px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); font-size: 13px; box-shadow: 0 8px 32px rgba(0,0,0,.18); z-index: 200; max-width: 80vw; }
.smc-toast.ok { border-color: var(--dsw-alias-state-success-primary); }
.smc-toast.error { border-color: var(--dsw-alias-state-error-primary); }

.smc-sidebar { display: flex; flex-direction: column; gap: 2px; padding: 8px; }
.smc-srv { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; }
.smc-srv:hover { background: var(--dsw-alias-interactive-bg-hover); }
.smc-srv-name { font-size: 13px; font-weight: 500; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-primary); }
.smc-srv-count { font-size: 11px; color: var(--dsw-alias-label-tertiary); }
.smc-srv-state { font-size: 11px; color: var(--dsw-alias-label-caption); padding: 0 10px 6px 26px; }
.smc-empty { padding: 24px; text-align: center; color: var(--dsw-alias-label-tertiary); font-size: 12.5px; }
/* DSH 0.1.x 设置导航无 icon 契约（external section 一律默认齿轮）。settings-nav-icon
   标记本插件行后：隐藏壳渲染的齿轮 SVG，用 Lucide wrench 的 currentColor mask 替换，
   跟随原生导航 hover/active 颜色且不改变壳的 16px 图标节奏。 */
[data-dsh-skill-mcp-center-settings-nav] > svg:first-child { display: none; }
[data-dsh-skill-mcp-center-settings-nav]::before {
  content: '';
  flex: none;
  width: 16px;
  height: 16px;
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z'/%3E%3C/svg%3E") center / contain no-repeat;
}
`
let cssInjected = false
function injectCss(): void {
  if (cssInjected || typeof document === 'undefined') return
  cssInjected = true
  const style = document.createElement('style')
  style.setAttribute('data-plugin', '@max-null/dsh-skill-mcp-center')
  style.textContent = CSS
  document.head.append(style)
}

// ---- settings nav icon ----
// DSH 0.1.x 的 settings.section 注册只投影 id/order/label，设置壳对外部 section
// 一律渲染默认齿轮（无 icon 契约字段）。照 dsh-better-sidebar 的 settings-nav-icon
// 模式：MutationObserver 按 label 文本标记设置对话框里本插件那一行，由上面的
// CSS 把齿轮替换成扳手。标记不拥有壳结构，disposer 移除标记，HMR-safe。
const SETTINGS_NAV_MARKER = 'data-dsh-skill-mcp-center-settings-nav'
function registerSettingsNavIcon(label: () => string): () => void {
  let disposed = false
  const sync = (): void => {
    if (disposed) return
    const currentLabel = label().trim()
    const buttons = document.querySelectorAll<HTMLButtonElement>('[role="dialog"] nav button')
    for (const button of buttons) {
      const matches = currentLabel.length > 0 && button.textContent?.trim() === currentLabel
      if (matches) button.setAttribute(SETTINGS_NAV_MARKER, '')
      else button.removeAttribute(SETTINGS_NAV_MARKER)
    }
  }
  sync()
  const observer = new MutationObserver(sync)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  return () => {
    disposed = true
    observer.disconnect()
    document.querySelectorAll(`[${SETTINGS_NAV_MARKER}]`)
      .forEach((element) => { element.removeAttribute(SETTINGS_NAV_MARKER) })
  }
}

// ---- locale (DSH zh/en bilingual, follows the active UI language) ----
const LOCALE_NS = '@max-null/dsh-skill-mcp-center'
type T = (key: string, params?: Record<string, unknown>) => string
let t: T = (key) => key
let localeRevision = 0
const localeListeners = new Set<() => void>()
function useLocale(): number {
  const [rev, setRev] = useState(localeRevision)
  useEffect(() => {
    const l = () => { setRev(localeRevision) }
    localeListeners.add(l)
    return () => { localeListeners.delete(l) }
  }, [])
  return rev
}
const zhDict: Record<string, string> = {
  loading: '加载中…',
  loadFailed: '加载失败：{e}',
  noSkills: '未发现任何 skill（检查 ~/.dsh/skills 与项目 .agents/skills）',
  sourceSystem: '系统',
  sourceUser: '用户',
  sourceWorkspace: '工作区',
  sourceRuntime: '运行时',
  sectionSub: '管理（静态配置）· 运行时状态在右侧边栏',
  modelDisabled: '模型已停用',
  toggleModelVisible: '切换模型可见',
  skillReadonly: 'system/runtime 技能只读',
  enable: '启用',
  disable: '停用',
  provider: 'provider · {name}',
  addServer: '＋ 添加 server',
  hotApplied: '增删改热生效，免重启',
  edit: '编辑',
  remove: '删除',
  disableServer: '停用（断开并释放 context）',
  enableServer: '启用（重连）',
  serverNameLabel: 'serverName（[A-Za-z0-9_-]{1,32}）',
  transport: 'transport',
  command: 'command',
  argsLabel: 'args（空格分隔）',
  cwdLabel: 'cwd（可选）',
  url: 'url',
  cancel: '取消',
  add: '添加',
  save: '保存',
  serverNameInvalid: 'serverName 需匹配 [A-Za-z0-9_-]{1,32}',
  added: '已添加 {name}，热连接',
  updated: '已更新 {name}，热生效',
  removed: '已删除 {name}，工具已下线',
  enabledToast: '已启用 {name}（热生效）',
  disabledToast: '已停用 {name}（热生效）',
  skillToggled: '已切换 {name}，模型 catalog 即时生效',
  noMcpServer: '未配置 MCP server',
  connected: '已连接',
  notSynced: '未同步',
  failed: 'failed',
}
const enDict: Record<string, string> = {
  loading: 'Loading…',
  loadFailed: 'Failed to load: {e}',
  noSkills: 'No skills found (check ~/.dsh/skills and project .agents/skills)',
  sourceSystem: 'system',
  sourceUser: 'user',
  sourceWorkspace: 'workspace',
  sourceRuntime: 'runtime',
  sectionSub: 'Manage (static config) · runtime status lives in the sidebar',
  modelDisabled: 'Model disabled',
  toggleModelVisible: 'Toggle model visibility',
  skillReadonly: 'system/runtime skills are read-only',
  enable: 'Enable',
  disable: 'Disable',
  provider: 'provider · {name}',
  addServer: '＋ Add server',
  hotApplied: 'hot-applied, no restart',
  edit: 'Edit',
  remove: 'Remove',
  disableServer: 'Disable (disconnect & free context)',
  enableServer: 'Enable (reconnect)',
  serverNameLabel: 'serverName ([A-Za-z0-9_-]{1,32})',
  transport: 'transport',
  command: 'command',
  argsLabel: 'args (space-separated)',
  cwdLabel: 'cwd (optional)',
  url: 'url',
  cancel: 'Cancel',
  add: 'Add',
  save: 'Save',
  serverNameInvalid: 'serverName must match [A-Za-z0-9_-]{1,32}',
  added: 'Added {name}, hot-connected',
  updated: 'Updated {name}, hot-applied',
  removed: 'Removed {name}, tools offline',
  enabledToast: '{name} enabled (hot-applied)',
  disabledToast: '{name} disabled (hot-applied)',
  skillToggled: 'Toggled {name}, model catalog updates live',
  noMcpServer: 'No MCP server',
  connected: 'Connected',
  notSynced: 'Not synced',
  failed: 'failed',
}

// ---- wire types (mirror the host shapes) ----
interface SkillView {
  name: string
  description: string
  source: string
  provider: string
  modelInvocable: boolean
  userInvocable: boolean
  writable: boolean
  path: string
}
interface McpServer {
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
interface McpServerStatus {
  serverName: string
  fiberPhase: string | null
  toolCount: number
  connected: boolean
  statusSource: 'seam' | 'derived'
}

type Rpc = (endpoint: string, payload?: unknown) => Promise<unknown>
let rpc: Rpc = async () => { throw new Error('skill-mcp-center: rpc not wired') }

// ---- toast ----
let toastState: { message: string; kind: 'ok' | 'error' } | null = null
const toastListeners = new Set<() => void>()
function showToast(message: string, kind: 'ok' | 'error' = 'ok'): void {
  toastState = { message, kind }
  toastListeners.forEach(l => l())
}
function useToast(): { message: string; kind: 'ok' | 'error' } | null {
  const [t, setT] = useState(toastState)
  useEffect(() => {
    const l = () => { setT(toastState) }
    toastListeners.add(l)
    return () => { toastListeners.delete(l) }
  }, [])
  useEffect(() => {
    if (t === null) return
    const id = setTimeout(() => { toastState = null; toastListeners.forEach(l => l()) }, 3000)
    return () => clearTimeout(id)
  }, [t])
  return t
}

const SOURCE_GROUP: Record<string, { label: string; cls: string }> = {
  bundled: { label: 'sourceSystem', cls: 'bundled' },
  'user-dsh': { label: 'sourceUser', cls: 'user' },
  'user-agents': { label: 'sourceUser', cls: 'user' },
  'project-dsh': { label: 'sourceWorkspace', cls: 'workspace' },
  'project-agents': { label: 'sourceWorkspace', cls: 'workspace' },
  runtime: { label: 'sourceRuntime', cls: 'runtime' },
}

// ---- Skill tab ----
function SkillView() {
  useLocale()
  const [items, setItems] = useState<SkillView[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const load = useCallback(() => {
    void rpc('listSkills').then(
      v => { setError(null); setItems(v as SkillView[]) },
      e => { setError(e instanceof Error ? e.message : String(e)) },
    )
  }, [])
  useEffect(() => { load() }, [load])
  if (error !== null) return <p className="smc-sub">{t('loadFailed', { e: error })}</p>
  if (items === null) return <p className="smc-sub">{t('loading')}</p>
  if (items.length === 0) return <p className="smc-sub">{t('noSkills')}</p>
  const toggle = (s: SkillView) => {
    setBusy(s.path)
    void rpc('toggleSkill', { path: s.path }).then(
      () => { setBusy(null); load(); showToast(t('skillToggled', { name: s.name })) },
      e => { setBusy(null); showToast(e instanceof Error ? e.message : String(e), 'error') },
    )
  }
  return (
    <div>
      {items.map(s => {
        const g = SOURCE_GROUP[s.source] ?? { label: s.source, cls: '' }
        return (
          <div key={s.name} className="smc-card">
            <div className="smc-row">
              <span className="smc-name">{s.name}</span>
              <span className={`smc-badge ${g.cls}`}>{t(g.label)}</span>
              {!s.modelInvocable && <span className="smc-badge disabled">{t('modelDisabled')}</span>}
              <span className="smc-spacer" />
              <button
                type="button"
                className={`smc-toggle${s.writable && s.modelInvocable ? ' on' : ''}`}
                disabled={!s.writable || busy === s.name}
                title={s.writable ? t('toggleModelVisible') : t('skillReadonly')}
                onClick={() => { toggle(s) }}
                aria-label={s.modelInvocable ? t('disable') : t('enable')}
              />
            </div>
            <div className="smc-desc">{s.description}</div>
            <div className="smc-meta"><span className="smc-badge">{t('provider', { name: s.provider })}</span></div>
          </div>
        )
      })}
    </div>
  )
}

// ---- MCP tab ----
function McpView() {
  useLocale()
  const [items, setItems] = useState<McpServer[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<McpServer | 'new' | null>(null)
  const load = useCallback(() => {
    void rpc('listMcpServers').then(
      v => { setError(null); setItems(v as McpServer[]) },
      e => { setError(e instanceof Error ? e.message : String(e)) },
    )
  }, [])
  useEffect(() => { load() }, [load])
  if (error !== null) return <p className="smc-sub">{t('loadFailed', { e: error })}</p>
  if (items === null) return <p className="smc-sub">{t('loading')}</p>
  const toggle = (s: McpServer) => {
    void rpc('setMcpServerEnabled', { id: s.id, enabled: s.disabled }).then(
      () => { load(); showToast(t(s.disabled ? 'enabledToast' : 'disabledToast', { name: s.serverName })) },
      e => { showToast(e instanceof Error ? e.message : String(e), 'error') },
    )
  }
  const remove = (s: McpServer) => {
    void rpc('removeMcpServer', { id: s.id }).then(
      () => { load(); showToast(t('removed', { name: s.serverName })) },
      e => { showToast(e instanceof Error ? e.message : String(e), 'error') },
    )
  }
  const dotCls = (s: McpServer) => (s.fiberPhase === 'failed' ? ' failed' : (s.disabled ? ' idle' : ''))
  return (
    <div>
      <div className="smc-row" style={{ marginBottom: 12 }}>
        <button type="button" className="smc-btn primary" onClick={() => { setEditing('new') }}>{t('addServer')}</button>
        <span className="smc-spacer" />
        <span className="smc-sub">{t('hotApplied')}</span>
      </div>
      {editing !== null && <ServerForm server={editing === 'new' ? null : editing} onClose={() => { setEditing(null) }} onSaved={() => { setEditing(null); load() }} />}
      {items.map(s => (
        <div key={s.id} className="smc-card">
          <div className="smc-row">
            <span className="smc-name">{s.serverName}</span>
            <span className="smc-badge">{s.transport}</span>
            <span className={`smc-dot${dotCls(s)}`} />
            <span className="smc-spacer" />
            <button type="button" className="smc-btn" onClick={() => { setEditing(s) }}>{t('edit')}</button>
            <button type="button" className="smc-btn danger" onClick={() => { remove(s) }}>{t('remove')}</button>
            <button
              type="button"
              className={`smc-toggle${!s.disabled ? ' on' : ''}`}
              title={s.disabled ? t('enableServer') : t('disableServer')}
              onClick={() => { toggle(s) }}
              aria-label={s.disabled ? t('enable') : t('disable')}
            />
          </div>
          <div className="smc-desc">{s.transport === 'stdio' ? `${s.command ?? ''} ${(s.args ?? []).join(' ')}` : s.url}</div>
        </div>
      ))}
    </div>
  )
}

function ServerForm({ server, onClose, onSaved }: { server: McpServer | null; onClose: () => void; onSaved: () => void }) {
  useLocale()
  const [name, setName] = useState(server?.serverName ?? '')
  const [transport, setTransport] = useState<'stdio' | 'streamable-http'>(server?.transport ?? 'stdio')
  const [command, setCommand] = useState(server?.command ?? '')
  const [args, setArgs] = useState((server?.args ?? []).join(' '))
  const [cwd, setCwd] = useState(server?.cwd ?? '')
  const [url, setUrl] = useState(server?.url ?? '')
  const [error, setError] = useState('')
  const save = () => {
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(name)) { setError(t('serverNameInvalid')); return }
    const config = transport === 'stdio'
      ? { serverName: name, transport, command, args: args.split(/\s+/).filter(Boolean), cwd }
      : { serverName: name, transport, url }
    const call = server === null ? rpc('createMcpServer', { config }) : rpc('updateMcpServer', { id: server.id, config })
    void call.then(
      () => { onSaved(); showToast(server === null ? t('added', { name }) : t('updated', { name })) },
      e => { setError(e instanceof Error ? e.message : String(e)) },
    )
  }
  return (
    <div className="smc-form">
      <div className="smc-field">
        <span className="smc-label">{t('serverNameLabel')}</span>
        <input className="smc-input" value={name} onChange={e => { setName(e.target.value) }} placeholder="filesystem" />
      </div>
      <div className="smc-field">
        <span className="smc-label">{t('transport')}</span>
        <select className="smc-select" value={transport} onChange={e => { setTransport(e.target.value as 'stdio' | 'streamable-http') }}>
          <option value="stdio">stdio</option>
          <option value="streamable-http">streamable-http</option>
        </select>
      </div>
      {transport === 'stdio' ? (
        <>
          <div className="smc-field">
            <span className="smc-label">{t('command')}</span>
            <input className="smc-input" value={command} onChange={e => { setCommand(e.target.value) }} placeholder="npx" />
          </div>
          <div className="smc-field">
            <span className="smc-label">{t('argsLabel')}</span>
            <input className="smc-input" value={args} onChange={e => { setArgs(e.target.value) }} placeholder="-y @modelcontextprotocol/server-filesystem" />
          </div>
          <div className="smc-field">
            <span className="smc-label">{t('cwdLabel')}</span>
            <input className="smc-input" value={cwd} onChange={e => { setCwd(e.target.value) }} placeholder="" />
          </div>
        </>
      ) : (
        <div className="smc-field">
          <span className="smc-label">{t('url')}</span>
          <input className="smc-input" value={url} onChange={e => { setUrl(e.target.value) }} placeholder="https://mcp.example.com/xxx" />
        </div>
      )}
      {error !== '' && <div className="smc-error">{error}</div>}
      <div className="smc-row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button type="button" className="smc-btn" onClick={onClose}>{t('cancel')}</button>
        <button type="button" className="smc-btn primary" onClick={save}>{server === null ? t('add') : t('save')}</button>
      </div>
    </div>
  )
}

// ---- settings section ----
function CenterPanel() {
  useLocale()
  const [view, setView] = useState<'skill' | 'mcp'>('skill')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ flex: 'none' }}>
        <div className="smc-title">Skill &amp; MCP</div>
        <div className="smc-sub">{t('sectionSub')}</div>
        <div className="smc-tabs">
          <button type="button" className={`smc-tab${view === 'skill' ? ' active' : ''}`} onClick={() => { setView('skill') }}>Skill</button>
          <button type="button" className={`smc-tab${view === 'mcp' ? ' active' : ''}`} onClick={() => { setView('mcp') }}>MCP</button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {view === 'skill' ? <SkillView /> : <McpView />}
      </div>
    </div>
  )
}

// ---- sidebar MCP status tab ----
function McpSidebarTab({ visible }: { visible: boolean }) {
  useLocale()
  const [items, setItems] = useState<McpServerStatus[]>([])
  useEffect(() => {
    if (!visible) return
    const tick = (): void => { void rpc('mcpStatus').then(v => { setItems(v as McpServerStatus[]) }).catch(() => {}) }
    tick()
    const timer = setInterval(tick, 1000)
    return () => { clearInterval(timer) }
  }, [visible])
  if (items.length === 0) return <div className="smc-empty">{t('noMcpServer')}</div>
  return (
    <div className="smc-sidebar">
      {items.map(s => {
        const dotCls = s.fiberPhase === 'failed' ? ' failed' : (s.connected ? '' : ' idle')
        const state = s.fiberPhase === 'failed' ? t('failed') : (s.connected ? t('connected') : t('notSynced'))
        return (
          <div key={s.serverName}>
            <div className="smc-srv" title={`fiber ${s.fiberPhase ?? '?'} · ${s.toolCount} tools (${s.statusSource})`}>
              <span className={`smc-dot${dotCls}`} />
              <span className="smc-srv-name">{s.serverName}</span>
              <span className="smc-srv-count">{s.toolCount} tools</span>
            </div>
            <div className="smc-srv-state">{state}</div>
          </div>
        )
      })}
    </div>
  )
}

function Toast() {
  const toast = useToast()
  if (toast === null) return null
  return <div className={`smc-toast ${toast.kind}`}>{toast.message}</div>
}

// ---- sidebar skills tab (session-scoped: user + project skills) ----
function SidebarSkillTab({ visible, cwd }: { visible: boolean; cwd?: string }) {
  useLocale()
  const [items, setItems] = useState<SkillView[]>([])
  const load = useCallback(() => {
    void rpc('listSkills', { cwd }).then(
      v => { setItems(v as SkillView[]) },
      () => { setItems([]) },
    )
  }, [cwd])
  useEffect(() => {
    if (!visible) return
    load()
  }, [visible, load])
  if (items.length === 0) return <div className="smc-empty">{t('noSkills')}</div>
  return (
    <div className="smc-sidebar">
      {items.map(s => (
        <div key={s.path} className="smc-srv" title={`${s.description}\n${s.path}`}>
          <span className={`smc-dot${s.modelInvocable ? '' : ' idle'}`} />
          <span className="smc-srv-name">{s.name}</span>
          <button
            type="button"
            className={`smc-toggle${s.modelInvocable ? ' on' : ''}`}
            title={t('toggleModelVisible')}
            onClick={() => { void rpc('toggleSkill', { path: s.path }).then(() => { load() }) }}
            aria-label={s.modelInvocable ? t('disable') : t('enable')}
          />
        </div>
      ))}
    </div>
  )
}

// ---- client plugin body ----
const inject = ['slots', 'connection', 'locale']

function apply(ctx: {
  slots: any
  connection: any
  locale: { register: (ns: string, locale: string, dict: Record<string, string>) => () => void; bind: (ns: string) => T; subscribe: (fn: () => void) => () => void }
  effect: (fn: () => void | (() => void)) => void
  inject: (name: string[], fn: (sub: any) => void) => void
}): void {
  injectCss()
  rpc = async (endpoint: string, payload: unknown = {}): Promise<unknown> => {
    const result = await ctx.connection.rpc.call('/skill-mcp', endpoint, payload)
    if (result.ok) return result.value
    throw new Error(result.error?.message ?? `skill-mcp-center: ${endpoint} failed`)
  }

  // Bilingual copy: register zh/en dictionaries, bind the translate fn, and
  // re-render mounted components on every locale switch (locale.subscribe).
  ctx.effect(() => {
    const d1 = ctx.locale.register(LOCALE_NS, 'zh', zhDict)
    const d2 = ctx.locale.register(LOCALE_NS, 'en', enDict)
    return () => { d1(); d2() }
  })
  t = ctx.locale.bind(LOCALE_NS)
  ctx.effect(() => ctx.locale.subscribe(() => {
    localeRevision += 1
    localeListeners.forEach(l => l())
  }))

  // 设置导航图标：标记本插件行后由 CSS 把默认齿轮替换为扳手（HMR-safe）。
  ctx.effect(() => registerSettingsNavIcon(() => 'Skill & MCP'))

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'skill-mcp-center', order: 60, label: () => 'Skill & MCP',
  }, CenterPanel))

  // Sidebar tabs (optional peer — without dsh-better-sidebar, registers nothing).
  ctx.inject(['betterSidebar'], (sidebarCtx: { betterSidebar?: { registerTab: (tab: unknown) => unknown }; effect: (fn: () => unknown) => void }) => {
    const service = sidebarCtx.betterSidebar
    if (service === undefined) return
    sidebarCtx.effect(() => service.registerTab({
      id: '@max-null/dsh-skill-mcp-center:mcp',
      title: () => 'MCP',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      ),
      order: 70,
      single: true,
      component: (props: { visible: boolean }) => <McpSidebarTab visible={props.visible} />,
    }))
    sidebarCtx.effect(() => service.registerTab({
      id: '@max-null/dsh-skill-mcp-center:skills',
      title: () => 'Skill',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
      ),
      order: 71,
      single: true,
      component: (props: { visible: boolean; scope?: { cwd?: string } }) => <SidebarSkillTab visible={props.visible} cwd={props.scope?.cwd} />,
    }))
  })

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay', id: 'skill-mcp-center-toast', order: 90,
  }, Toast))
}

export { inject, apply }
