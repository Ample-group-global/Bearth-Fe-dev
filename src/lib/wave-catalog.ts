"use server";

export interface WaveCatalogEntry {
  waveNumber: number;
  name: string;
  saleMethod: string;
  priceEth: number;
  qty: number;
}

export async function getWaveCatalog(): Promise<WaveCatalogEntry[]> {
  const res = await fetch(`${process.env.BEARTH_API_URL}/api/waves/public`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.waves ?? [];
}
