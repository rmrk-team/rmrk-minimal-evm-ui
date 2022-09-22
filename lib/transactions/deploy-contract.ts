import { NewTransaction } from '@rainbow-me/rainbowkit/dist/transactions/transactionStore';
import { BigNumber, Contract, ethers, Signer } from 'ethers';
import { RMRKMultiResourceFactoryContractAddress } from '../../constants';

interface IProps {
  signer?: ethers.Signer | null;
  registryContract: Contract;
  tokenContract: Contract;
  factoryContract: Contract;
  addRecentTransaction: (transaction: NewTransaction) => void;
  data: { [key: string]: string | number };
}

export async function deployContract({
  signer,
  registryContract,
  tokenContract,
  factoryContract,
  addRecentTransaction,
  data,
}: IProps) {
  const { nameInput, symbolInput, maxSupplyInput, priceInput, collectionMetadataInput } = data;
  if (signer instanceof Signer) {
    const caller = await signer.getAddress();
    const deposit: BigNumber = await registryContract.getCollectionListingFee();
    const allowance: BigNumber = await tokenContract.allowance(
      caller,
      RMRKMultiResourceFactoryContractAddress,
    );
    if (allowance.lt(deposit)) {
      const approveTransactionResponse = await tokenContract.approve(
        RMRKMultiResourceFactoryContractAddress,
        deposit,
      );
      await approveTransactionResponse.wait();
    }
    const tx = await factoryContract
      .connect(signer)
      .deployRMRKMultiResource(
        nameInput,
        symbolInput,
        maxSupplyInput,
        priceInput,
        collectionMetadataInput,
      );

    addRecentTransaction({
      hash: tx.hash,
      description: 'Deploying a new RMRK NFT contract',
      confirmations: 1,
    });

    const receipt = await tx.wait();
    return receipt;
  }
}
