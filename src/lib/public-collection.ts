export interface PublicCollection {
  collectionId: string;
  name: string;
  contractAddress: string;
  network: string;
  currentPhase: string;
}

export async function getPublicCollection(): Promise<PublicCollection> {
  const res = await fetch(`${process.env.BEARTH_API_URL}/api/public/collection`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`Failed to resolve public collection (${res.status})`);
  }
  return res.json();
}
