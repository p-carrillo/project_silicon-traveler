const PLACEHOLDER_REGEX = /{{\s*([\w.-]+)\s*}}/g;

export function renderPromptTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(PLACEHOLDER_REGEX, (match, key: string) => {
    if (!(key in variables)) {
      throw new Error(`Missing prompt variable: ${key}`);
    }

    return variables[key];
  });
}
