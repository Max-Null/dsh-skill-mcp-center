/**
 * Minimal SKILL.md frontmatter editing for `disable-model-invocation`.
 * Text-level (not a full YAML round-trip) so unrelated frontmatter keys,
 * comments, and formatting survive untouched.
 */
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
