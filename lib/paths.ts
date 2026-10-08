/** Build-time deployment prefix. Next Link/router already apply this automatically. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Only use for native media, metadata and sanitized Markdown, never Next Link. */
export function withBasePath(url: string, prefix = basePath): string {
  if (!prefix || !url.startsWith("/") || url.startsWith("//")) return url;
  if (url === prefix || url.startsWith(`${prefix}/`) || url.startsWith(`${prefix}?`) || url.startsWith(`${prefix}#`)) return url;
  return `${prefix}${url}`;
}

/** Input must already be sanitized by the content pipeline. */
export function prefixContentHtml(html: string, prefix = basePath): string {
  return html.replace(/\b(href|src)="(\/(?!\/)[^"]*)"/g,
    (_match, attribute: string, url: string) => `${attribute}="${withBasePath(url, prefix)}"`);
}
