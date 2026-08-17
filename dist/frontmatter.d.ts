/**
 * Minimal SKILL.md frontmatter editing for `disable-model-invocation`.
 * Text-level (not a full YAML round-trip) so unrelated frontmatter keys,
 * comments, and formatting survive untouched.
 */
/** Toggle `disable-model-invocation` in SKILL.md text; creates frontmatter if absent. */
export declare function setDisableModelInvocation(text: string, disabled: boolean): string;
