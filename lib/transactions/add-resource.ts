import { NewTransaction } from '@rainbow-me/rainbowkit/dist/transactions/transactionStore';
import { Contract, ethers, Signer } from 'ethers';

interface IProps {
  contract: Contract;
  resourceInput: string;
  signer?: ethers.Signer | null;
  addRecentTransaction: (transaction: NewTransaction) => void;
}

export const addResource = async ({
  contract,
  signer,
  resourceInput,
  addRecentTransaction,
}: IProps) => {
  if (signer instanceof Signer) {
    const tx = await contract.connect(signer).addResourceEntry(resourceInput);
    addRecentTransaction({
      hash: tx.hash,
      description: 'Adding a new resource to collection',
      confirmations: 1,
    });
    await tx.wait(1);
  }
};
