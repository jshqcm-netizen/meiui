/** Enhance only the sanitized HTML produced by lib/content.ts. Never pass raw authored HTML here. */
export function prepareReadingHtml(sanitizedHtml: string): string {
  let index = 0;
  return sanitizedHtml.replace(
    /<pre>([\s\S]*?)<\/pre>/g,
    (_block, code: string) => {
      index++;
      const language =
        code
          .match(/<code\s+class="language-([a-zA-Z0-9_+-]+)"/)?.[1]
          ?.toLowerCase() ?? "text";
      const labels: Record<string, string> = {
        js: "JavaScript",
        javascript: "JavaScript",
        ts: "TypeScript",
        typescript: "TypeScript",
        tsx: "TSX",
        bash: "Shell",
        sh: "Shell",
        shell: "Shell",
        json: "JSON",
        yaml: "YAML",
        yml: "YAML",
        markdown: "Markdown",
        md: "Markdown",
        html: "HTML",
        css: "CSS",
        text: "纯文本",
      };
      const label = labels[language] ?? "代码";
      return `<div class="code-frame"><div class="code-toolbar"><span class="code-language">${label}</span><button type="button" data-copy-code="${index}" aria-label="复制第 ${index} 段代码">复制代码</button></div><pre id="code-block-${index}" tabindex="0" role="region" aria-label="${label}代码块，可左右滚动">${code}</pre></div>`;
    },
  );
}
