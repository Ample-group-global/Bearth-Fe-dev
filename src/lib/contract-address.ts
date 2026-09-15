// NEXT_PUBLIC_CONTRACT_ADDRESS has hit whitespace issues before (see the
// .replace(/\s+/g, "") already applied ad hoc in a couple of call sites) --
// centralizing the sanitization here instead of leaving it inconsistently
// applied. Whitespace in this value silently breaks any backend lookup that
// does an exact match against the stored contract_address column (no row
// found -> 404 -> "Couldn't load" style errors), so every caller needs it
// cleaned the same way, not just the ones someone remembered to fix.
export function getContractAddress(): string {
  return (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "").replace(/\s+/g, "");
}
