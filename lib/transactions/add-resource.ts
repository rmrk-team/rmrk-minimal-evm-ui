import { NewTransaction } from '@rainbow-me/rainbowkit/dist/transactions/transactionStore';
import { Contract, ethers, Signer } from 'ethers';

interface IProps {
  signer?: ethers.Signer | null;
  contractAddress: string;
  abi: ethers.ContractInterface;
  resourceInput: string;
  addRecentTransaction: (transaction: NewTransaction) => void;
}

export const addResource = async ({
  signer,
  contractAddress,
  abi,
  resourceInput,
  addRecentTransaction,
}: IProps) => {
  if (signer instanceof Signer) {
    const multiResourceContract = new Contract(contractAddress, abi, signer);
    const tx = await multiResourceContract.connect(signer).addResourceEntry(resourceInput);
    addRecentTransaction({
      hash: tx.hash,
      description: 'Adding a new resource to collection',
      confirmations: 1,
    });
    await tx.wait(1);
  }
};
