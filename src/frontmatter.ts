/**
 * Minimal SKILL.md frontmatter editing and parsing for `disable-model-invocation`.
 * Text-level editing (not a full YAML round-trip) so unrelated frontmatter keys,
 * comments, and formatting survive untouched.
 */
import { load } from 'js-yaml'

/** Toggle `disable-model-invocation` in SKILL.md text; creates frontmatter if absent. */
export function setDisableModelInvocation(text: string, disabled: boolean): string {
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (match === null) {
    return `---${eol}disable-model-invocation: ${disabled}${eol}---${eol}${eol}${text}`
  }
  const full = match[0]
  const body = match[1]!
  const line = /^(\s*)disable-model-invocation\s*:.*$/m
  const next = line.test(body)
    ? body.replace(line, `$1disable-model-invocation: ${disabled}`)
    // 追加分支沿用文件现有行尾(CRLF 文件不混入 LF,防止混合行尾扩散)。
    : body.replace(/\s*$/, `${eol}disable-model-invocation: ${disabled}`)
  return text.replace(full, full.replace(body, next))
}

/** Parsed SKILL.md metadata relevant to the management surface. */
export interface SkillFrontmatter {
  name: string
  description: string
  modelInvocable: boolean
}

/** Parse a SKILL.md frontmatter block; null when absent or missing a name. */
export function parseSkillFrontmatter(text: string): SkillFrontmatter | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (match === null) return null
  try {
    const data = load(match[1]!) as Record<string, unknown>
    if (typeof data.name !== 'string' || data.name.trim() === '') return null
    return {
      name: data.name,
      description: typeof data.description === 'string' ? data.description : '',
      modelInvocable: data['disable-model-invocation'] !== true,
    }
  } catch {
    return null
  }
}
