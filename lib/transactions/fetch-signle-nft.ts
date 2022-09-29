import { Contract } from 'ethers';

interface IProps {
  contract: Contract;
  tokenId: string;
}

export const fetchSignleNft = async ({ contract, tokenId }: IProps) => {
  const name: string = await contract.name();
  const tokenUri: string = await contract.tokenURI(tokenId);
  const allResources: string[] = await contract.getAllResources();
  const activeResources: string[] = await contract.getActiveResources(tokenId);
  const pendingResources: string[] = await contract.getPendingResources(tokenId);
  const allData: string[] = [];
  const pendingResourcesData: string[] = [];
  const activeResourcesData: string[] = [];
  for (const r of allResources) {
    const resourceData = await contract.getResource(r);
    allData.push(resourceData);
  }
  for (const r of pendingResources) {
    const resourceData = await contract.getResource(r);
    pendingResourcesData.push(resourceData);
  }
  for (const r of activeResources) {
    const resourceData = await contract.getResource(r);
    activeResourcesData.push(resourceData);
  }

  return {
    allData,
    pendingResourcesData,
    activeResourcesData,
    name,
    allResources,
    activeResources,
    pendingResources,
    tokenUri,
  };
};
