import { Contract, ethers, Signer } from 'ethers';
import abis from '../../abis/abis';

interface IProps {
  signer?: ethers.Signer | null;
  factoryContract: Contract;
}
export const getCollections = async ({ signer, factoryContract }: IProps) => {
  const collections: string[] = [];
  if (signer instanceof Signer) {
    const allCollectionDeployments = await factoryContract.getCollections();
    const address = await signer.getAddress();
    for (let i = 0; i < allCollectionDeployments.length; i++) {
      const collection = new Contract(allCollectionDeployments[i], abis.multiResourceAbi, signer);
      const owner = await collection.owner();

      if (owner === address) {
        collections.push(allCollectionDeployments[i]);
      }
    }
  }
  return collections;
};
