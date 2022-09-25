import { Contract, ethers, Signer } from 'ethers';

interface IProps {
  signer?: ethers.Signer | null;
  contractAddress: string;
  abi: ethers.ContractInterface;
}

export const fetchNftCollection = async ({ signer, contractAddress, abi }: IProps) => {
  let allData: string[] = [];
  let allResources: string[] = [];
  let name = '';
  if (signer instanceof Signer && ethers.utils.isAddress(contractAddress)) {
    const multiResourceContract = new Contract(contractAddress, abi, signer);
    name = await multiResourceContract.name();
    allResources = await multiResourceContract.getAllResources();

    for (const r of allResources) {
      const resourceData = await multiResourceContract.getResource(r);
      allData.push(resourceData);
    }
  }
  return { allData, allResources, name };
};
