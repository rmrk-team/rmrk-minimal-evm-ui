import NftList from "../../components/nft-list"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ethers } from "ethers"
import { useContract, useSigner } from "wagmi"
import { ConnectButton, useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import { NextPage } from "next"
import styles from "../../styles/Home.module.css"
import Head from "next/head"
import Resource from "../../components/resource"
import abis from "../../abis/abis"
import AddResourceToCollection from "../../components/add-resource"
import {
  fetchNftCollection,
  getOwnedNfts,
  mintNft,
} from "../../lib/transactions"
import { addResource } from "../../lib/transactions"

const MultiResourceNftCollection: NextPage = () => {
  const router = useRouter()
  const { contractAddress } = router.query
  const addRecentTransaction = useAddRecentTransaction()
  const { data: signer } = useSigner()
  const [currentRmrkDeployment, setCurrentRmrkDeployment] = useState<string>("")
  const [allResourcesData, setAllResourcesData] = useState<string[]>([])
  const [resources, setResources] = useState<string[]>([])
  const [resourceInput, setResourceInput] = useState<string>("")
  const [collectionName, setCollectionName] = useState<string>("")
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [ownedNfts, setOwnedNfts] = useState<
    { tokenId: number; owner: string; tokenUri: string }[]
  >([])
  const multiResourceContract = useContract({
    addressOrName: currentRmrkDeployment,
    contractInterface: abis.multiResourceAbi,
    signerOrProvider: signer,
  })

  useEffect(() => {
    console.log("Loading chain data")
    console.log(currentRmrkDeployment)
    if (ethers.utils.isAddress(contractAddress as string)) {
      setCurrentRmrkDeployment(contractAddress as string)
      fetchNftCollection({
        signer,
        contractAddress: currentRmrkDeployment,
        abi: abis.multiResourceAbi,
      }).then(({ allData, allResources, name }) => {
        setAllResourcesData(allData)
        setResources(allResources)
        setCollectionName(name)
      })
      getOwnedNfts({
        signer,
        contractAddress: currentRmrkDeployment,
        abi: abis.multiResourceAbi,
      }).then(({ nfts, isContractOwner }) => {
        setIsOwner(isContractOwner)
        setOwnedNfts(nfts)
      })
    }
  }, [signer, contractAddress])

  const onAddResource = () => {
    addResource({
      contract: multiResourceContract,
      addRecentTransaction,
      signer,
      resourceInput,
    }).then(() => {
      fetchNftCollection({
        signer,
        contractAddress: currentRmrkDeployment,
        abi: abis.multiResourceAbi,
      }).then(({ allData, allResources, name }) => {
        setAllResourcesData(allData)
        setResources(allResources)
        setCollectionName(name)
      })
    })
  }

  const onMint = () => {
    mintNft({
      signer,
      contractAddress: currentRmrkDeployment,
      addRecentTransaction,
    }).then(() =>
      getOwnedNfts({
        signer,
        contractAddress: currentRmrkDeployment,
        abi: abis.multiResourceAbi,
      }).then(({ nfts, isContractOwner }) => {
        setIsOwner(isContractOwner)
        setOwnedNfts(nfts)
      })
    )
  }

  const handleResourceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResourceInput(e.target.value)
  }

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

        <h4 className={styles.description}>
          Collection name: {collectionName}
        </h4>
        <ul className="mt-1">Usage Notes:</ul>
        <li>
          You have to be the Owner of the NFT Collection to add new resources
        </li>
        <li>
          If you are not authorized like above the transactions will be reverted
        </li>

        <p className="mb-4 mt-5">
          Mint an NFT to be able to attach multiple resources to it:
        </p>
        <button onClick={onMint} className="btn btn-wide btn-primary">
          Mint NFT
        </button>
        <p className="mt-5">
          It might take a few minutes to show your NFTs when just minted.
        </p>
        <p className="mb-5">
          Click on the NFT card to open resource management page.
        </p>
        <NftList
          nfts={ownedNfts}
          tokenContract={currentRmrkDeployment}
          tokenType={"contract"}
        />

        <p className="text-center text-2xl mt-10">NFT Collection Resources:</p>
        {resources.map((resource, index) => {
          return (
            <div key={index} className={styles.card}>
              <Resource
                key={index}
                resource={resource}
                strings={allResourcesData}
                index={index}
              />
            </div>
          )
        })}
        {isOwner && (
          <AddResourceToCollection
            value={resourceInput}
            onChange={handleResourceInput}
            onClick={onAddResource}
          />
        )}
      </main>
      <footer className={styles.footer}></footer>
    </div>
  )
}

export default MultiResourceNftCollection
