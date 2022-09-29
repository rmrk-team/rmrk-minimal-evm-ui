import { Contract, ethers, Signer } from 'ethers';

interface IProps {
  signer?: ethers.Signer | null;
  contractAddress: string;
  abi: ethers.ContractInterface;
}

export const getOwnedNfts = async ({ signer, contractAddress, abi }: IProps) => {
  const nfts = [];
  let isContractOwner = false;
  if (signer instanceof Signer && ethers.utils.isAddress(contractAddress)) {
    const multiResourceContract = new Contract(contractAddress, abi, signer);
    const owner = await multiResourceContract.owner();
    const caller = await signer.getAddress();
    if (owner === caller) isContractOwner = true;
    const nftSupply = await multiResourceContract.totalSupply();
    for (let i = 1; i <= nftSupply.toNumber(); i++) {
      let isAssetOwner = false;
      try {
        const assetOwner = await multiResourceContract.connect(signer).ownerOf(i);
        const caller = await signer.getAddress();
        isAssetOwner = assetOwner === caller;
      } catch (error) {
        console.log(error);
      }
      if (isAssetOwner) {
        const owner = await signer.getAddress();
        const tokenUri = await multiResourceContract.tokenURI(i);
        nfts.push({
          tokenId: i,
          owner,
          tokenUri,
        });
      }
    }
  }
  return { nfts, isContractOwner };
};
