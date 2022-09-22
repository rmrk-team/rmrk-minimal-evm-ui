import { Contract, ethers, Signer } from 'ethers';
import abis from '../../abis/abis';

interface IProps {
  signer?: ethers.Signer | null;
  contractAddress: string;
}

export async function getOwnedNfts({ signer, contractAddress }: IProps) {
  const nfts = [];

  if (signer instanceof Signer && ethers.utils.isAddress(contractAddress)) {
    const multiResourceContract = new Contract(contractAddress, abis.multiResourceAbi, signer);

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
  return nfts;
}
