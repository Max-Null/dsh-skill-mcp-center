/** Toggle `disable-model-invocation` in SKILL.md text; creates frontmatter if absent. */
export declare function setDisableModelInvocation(text: string, disabled: boolean): string;
/** Parsed SKILL.md metadata relevant to the management surface. */
export interface SkillFrontmatter {
    name: string;
    description: string;
    modelInvocable: boolean;
}
/** Parse a SKILL.md frontmatter block; null when absent or missing a name. */
export declare function parseSkillFrontmatter(text: string): SkillFrontmatter | null;
