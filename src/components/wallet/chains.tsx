import { mainnet, sepolia } from "viem/chains";

export const chains = {
  sepolia: sepolia,
  mainnet: mainnet,
};

export const chainOptions = {
  sepolia: {
    openseaUrl: (contractAddress: string, tokenId: string) =>
      `https://sepolia.etherscan.io/nft/${contractAddress}/${tokenId}`,
    blockExplorerUrl: (txHash: string) =>
      `https://sepolia.etherscan.io/tx/${txHash}`,
  },
  mainnet: {
    openseaUrl: (contractAddress: string, tokenId: string) =>
      `https://opensea.io/item/ethereum/${contractAddress}/${tokenId}`,
    blockExplorerUrl: (txHash: string) => `https://etherscan.io/tx/${txHash}`,
  },
};
