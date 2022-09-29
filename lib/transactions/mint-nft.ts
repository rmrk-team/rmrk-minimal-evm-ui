import { NewTransaction } from '@rainbow-me/rainbowkit/dist/transactions/transactionStore';
import { Contract, ethers, Signer } from 'ethers';
import abis from '../../abis/abis';

interface IProps {
  signer?: ethers.Signer | null;
  contractAddress: string;
  addRecentTransaction: (transaction: NewTransaction) => void;
}
export const mintNft = async ({ signer, contractAddress, addRecentTransaction }: IProps) => {
  if (signer instanceof Signer && ethers.utils.isAddress(contractAddress)) {
    const caller = await signer.getAddress();
    const multiResourceContract = new Contract(contractAddress, abis.multiResourceAbi, signer);
    const value = await multiResourceContract.pricePerMint();
    const options = {
      value,
    };
    const tx = await multiResourceContract.connect(signer).mint(caller, 1, options);
    await tx.wait();
    addRecentTransaction({
      hash: tx.hash,
      description: 'Minting a new RMRK NFT',
      confirmations: 1,
    });
  }
};
