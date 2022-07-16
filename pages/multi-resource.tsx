import { ConnectButton, useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import type { NextPage } from "next"
import Head from "next/head"
import styles from "../styles/Home.module.css"
import { rmrkMultiResourceContract } from "../constants"
import {
  useAccount,
  useConnect,
  useContractRead,
  useContractWrite,
  useEnsName,
  useProvider,
  useSigner,
} from "wagmi"
import { fetchSigner, InjectedConnector, Provider } from "@wagmi/core"
import { Contract, Signer } from "ethers"
import NftList from "./nftList"
import { add } from "unload"
import { forEach } from "@vanilla-extract/css/dist/declarations/src/utils"
import { sign } from "crypto"
import { useEffect, useState } from "react"
import { is } from "@babel/types"
import { tryCatch } from "rxjs/internal-compatibility"

async function getOwnedNfts(signer: Signer) {
  const multiResourceContract = new Contract(
    rmrkMultiResourceContract.addressOrName,
    rmrkMultiResourceContract.contractInterface,
    signer
  )
  const nftSupply = await multiResourceContract.totalSupply()
  const nfts = []
  for (let i = 0; i < nftSupply; i++) {
    let isOwner = false
    try {
      isOwner =
        (await multiResourceContract.connect(signer).ownerOf(i)) ==
        (await signer.getAddress())
    } catch (error) {
      console.log(error)
    }

    if (isOwner) {
      nfts.push({
        tokenId: i,
        owner: await signer.getAddress(),
        tokenUri: await multiResourceContract.tokenURI(i),
      })
    }
  }
  return nfts
  // const filter = multiResourceContract.filters.Transfer(
  //   null,
  //   signer.getAddress()
  // )
  // const events = await multiResourceContract.queryFilter(filter, -10000)
}

const MultiResource: NextPage = () => {
  const provider = useProvider()
  const { data: signer, isSuccess } = useSigner()
  const { address, isConnected } = useAccount()

  const {
    data,
    isError,
    write: mintNft,
  } = useContractWrite({
    ...rmrkMultiResourceContract,
    functionName: "mint",
    args: [address, 1],
  })

  const { data: nftBalance = "" } = useContractRead({
    ...rmrkMultiResourceContract,
    functionName: "balanceOf",
    args: address,
  })

  const addRecentTransaction = useAddRecentTransaction()

  const [ownedNfts, setOwnedNfts] = useState<
    { tokenId: number; owner: string; tokenUri: string }[]
  >([])

  useEffect(() => {
    if (signer instanceof Signer) {
      console.log("getting owned nfts")
      getOwnedNfts(signer).then((nfts) => setOwnedNfts(nfts))
    }
  }, [signer])

  return (
    <div className={styles.container}>
      <Head>
        <title>RMRK Multi-resource App</title>
        <meta
          name="description"
          content="Generated by @rainbow-me/create-rainbowkit"
        />
        {/*<link rel="icon" href="/favicon.ico" />*/}
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <h1 className={styles.title}>Multi-resource Demo</h1>
        <p className={styles.description}>
          Mint an NFT and attach additional resources below:
        </p>

        <button
          onClick={() => {
            mintNft()
            addRecentTransaction({
              hash: "0x...",
              description: "Minting NFT",
              confirmations: 1,
            })
          }}
          className={styles.button}
        >
          Mint NFT
        </button>

        <p className={styles.description}>Your RMRK NFTs:</p>

        <NftList balance={nftBalance} nfts={ownedNfts} />
      </main>

      <footer className={styles.footer}></footer>
    </div>
  )
}

export default MultiResource
