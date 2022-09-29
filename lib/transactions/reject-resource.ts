import { NewTransaction } from '@rainbow-me/rainbowkit/dist/transactions/transactionStore';
import { Contract, ethers, Signer } from 'ethers';

interface IProps {
  contract: Contract;
  resourceId: number;
  signer?: ethers.Signer | null;
  tokenId: string;
  addRecentTransaction: (transaction: NewTransaction) => void;
}

export const rejectResource = async ({
  resourceId,
  signer,
  contract,
  addRecentTransaction,
  tokenId,
}: IProps) => {
  if (signer instanceof Signer) {
    const tx = await contract.connect(signer).rejectResource(tokenId, resourceId);
    addRecentTransaction({
      hash: tx.hash,
      description: 'Rejecting a resource for this NFT',
      confirmations: 1,
    });
    await tx.wait(1);
  }
};
