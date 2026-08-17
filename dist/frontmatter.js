/**
 * Minimal SKILL.md frontmatter editing and parsing for `disable-model-invocation`.
 * Text-level editing (not a full YAML round-trip) so unrelated frontmatter keys,
 * comments, and formatting survive untouched.
 */
import { load } from 'js-yaml';
/** Toggle `disable-model-invocation` in SKILL.md text; creates frontmatter if absent. */
export function setDisableModelInvocation(text, disabled) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    if (match === null) {
        return `---\ndisable-model-invocation: ${disabled}\n---\n\n${text}`;
    }
    const full = match[0];
    const body = match[1];
    const line = /^(\s*)disable-model-invocation\s*:.*$/m;
    const next = line.test(body)
        ? body.replace(line, `$1disable-model-invocation: ${disabled}`)
        : body.replace(/\s*$/, `\ndisable-model-invocation: ${disabled}`);
    return text.replace(full, full.replace(body, next));
}
/** Parse a SKILL.md frontmatter block; null when absent or missing a name. */
export function parseSkillFrontmatter(text) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    if (match === null)
        return null;
    try {
        const data = load(match[1]);
        if (typeof data.name !== 'string' || data.name.trim() === '')
            return null;
        return {
            name: data.name,
            description: typeof data.description === 'string' ? data.description : '',
            modelInvocable: data['disable-model-invocation'] !== true,
        };
    }
    catch {
        return null;
    }
}
