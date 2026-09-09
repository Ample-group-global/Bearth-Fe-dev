// DB names carry a " — <sale method>" suffix for waves 1-2 (e.g. "Genesis — Free Mint")
// that duplicates info shown elsewhere in the UI -- this strips it down to the series
// name alone (e.g. "Genesis") for compact display.
export function waveSeriesName(name: string): string {
  return name.split(" — ")[0];
}

// DB sale_method is a snake_case enum ("free_mint", "fixed_price") -- never render
// that directly in the UI; convert to a presentable label.
export function formatSaleMethod(saleMethod: string): string {
  return saleMethod
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
