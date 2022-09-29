import { NewTransaction } from '@rainbow-me/rainbowkit/dist/transactions/transactionStore';
import { Contract, ethers, Signer } from 'ethers';

interface IProps {
  contract: Contract;
  resourceId: number;
  signer?: ethers.Signer | null;
  tokenId: string;
  addRecentTransaction: (transaction: NewTransaction) => void;
}
export const addResourceToToken = async ({
  signer,
  contract,
  tokenId,
  resourceId,
  addRecentTransaction,
}: IProps) => {
  if (signer instanceof Signer) {
    const tx = await contract.connect(signer).addResourceToToken(tokenId, resourceId, 0);
    addRecentTransaction({
      hash: tx.hash,
      description: 'Adding a resource to this NFT',
      confirmations: 1,
    });
    await tx.wait(1);
  }
};
