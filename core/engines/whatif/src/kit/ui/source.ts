/** The text of an on-screen source tag: the sites the cited ledger rows come from, each once, in citation order.
 *  `ledger` maps a claim id to its source URL (claims.md, carried into story.json). */
export function sourceLabel(ids: string[], ledger: Record<string, string>): string {
  const hosts: string[] = [];
  for (const id of ids) {
    const url = ledger[id];
    if (!url) throw new Error(`claim ${id} has no source URL in the ledger`);
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (!hosts.includes(host)) hosts.push(host);
  }
  if (!hosts.length) return "";
  return `${hosts.length > 1 ? "Sources" : "Source"}: ${hosts.join(" · ")}`;
}
