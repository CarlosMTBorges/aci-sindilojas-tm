const allowedTags = new Set(["p", "div", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote"]);

/** Keeps only basic editorial markup and removes scripts, links, and event/style attributes. */
export function sanitizeRichText(value: string): string {
  const withoutDangerousBlocks = value.replace(/<(script|style|iframe|object|svg)[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  return withoutDangerousBlocks.replace(/<\/?([a-z0-9-]+)\b([^>]*)>/gi, (tag, rawName: string, attrs: string) => {
    const name = rawName.toLowerCase();
    if (!allowedTags.has(name)) return "";
    if (/^<\//.test(tag)) return `</${name}>`;
    if (name === "br") return "<br>";
    const align = attrs.match(/text-align\s*:\s*(left|center|right|justify)/i)?.[1]?.toLowerCase();
    return align ? `<${name} style="text-align:${align}">` : `<${name}>`;
  });
}

export function legacyBodyToHtml(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  if (typeof (content as { html?: unknown }).html === "string") return sanitizeRichText((content as { html: string }).html);
  const body = (content as { body?: unknown }).body;
  if (typeof body === "string") return sanitizeRichText(body);
  if (!Array.isArray(body)) return "";
  return body.map((paragraph) => {
    if (typeof paragraph === "string") return `<p>${escapeHtml(paragraph)}</p>`;
    if (paragraph && typeof paragraph === "object" && "html" in paragraph) {
      return sanitizeRichText(String((paragraph as { html: unknown }).html));
    }
    return "";
  }).join("");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}
