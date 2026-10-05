/** Public, serializable search entries only. Never pass draft/editor records here. */
export type SearchItem = {
  title: string;
  description: string;
  href: string;
  tags: string[];
  kind: string;
  text?: string;
  sample?: boolean;
};
const normalize = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase().trim();
export function searchContent(
  items: SearchItem[],
  query: string,
): SearchItem[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return items;
  return items
    .map((item, index) => {
      const title = normalize(item.title);
      const tags = normalize(item.tags.join(" "));
      const description = normalize(item.description);
      const body = normalize(item.text ?? "");
      const fields = [title, tags, description, body];
      if (!terms.every((term) => fields.some((field) => field.includes(term))))
        return null;
      const score = terms.reduce(
        (sum, term) =>
          sum +
          (title.includes(term)
            ? 5
            : tags.includes(term)
              ? 3
              : description.includes(term)
                ? 2
                : 1),
        0,
      );
      return { item, index, score };
    })
    .filter(
      (entry): entry is { item: SearchItem; index: number; score: number } =>
        entry !== null,
    )
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}
