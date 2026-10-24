/**
 * Identity helper for the skill list UI.
 *
 * Skills registered at runtime through `ctx.skills.register()` have no
 * `SKILL.md` on disk, so the host reports `path: ''` for every one of them
 * (`SkillMcpService.runtimeOnlySkills`). Using that empty string as a React
 * key or as the `expanded` / `mdPath` identity collapses all runtime entries
 * into one: expanding one card expands every runtime card, and the "view
 * SKILL.md" action sends `readSkill` an empty path, which the host rejects
 * with `readSkill: path is required`.
 *
 * Disk-backed skills keep their path, so their identity is unchanged.
 */

/**
 * Marks a synthetic key for a skill that has no file. A NUL byte cannot appear
 * in a filesystem path, so no real SKILL.md path can collide with the prefix.
 */
const RUNTIME_KEY_PREFIX = '\u0000runtime:'

/** The minimal shape this helper needs — structural, so callers need no import. */
interface KeyedSkill {
  name: string
  path: string
}

/**
 * Stable identity for one skill row.
 * @param skill - a skill entry as `listSkills` reported it.
 * @returns the SKILL.md path, or a synthetic key when the entry has no file.
 */
export function skillKeyOf(skill: KeyedSkill): string {
  return skill.path === '' ? `${RUNTIME_KEY_PREFIX}${skill.name}` : skill.path
}

/**
 * Whether a skill entry has a `SKILL.md` the panel can read and display.
 * @param skill - a skill entry as `listSkills` reported it.
 * @returns `false` for runtime-registered skills, which have no file.
 */
export function hasSkillFile(skill: KeyedSkill): boolean {
  return skill.path !== ''
}
