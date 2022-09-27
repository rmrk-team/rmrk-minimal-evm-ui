import { useRouter } from "next/router"
import styles from "../../../styles/Home.module.css"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import { Signer } from "ethers"
import { useContract, useProvider, useSigner } from "wagmi"
import { ConnectButton, useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import Resource from "../../../components/resource"
import abis from "../../../abis/abis"
import AddResourceToCollection from "../../../components/add-resource"
import { fetchSignleNft } from "../../../lib/transactions/fetch-signle-nft"
import {
  acceptResource,
  addResource,
  addResourceToToken,
  rejectResource,
} from "../../../lib/transactions"

const MultiResourceNft = () => {
  const provider = useProvider()
  const { data: signer } = useSigner()
  const addRecentTransaction = useAddRecentTransaction()
  const router = useRouter()
  const query: string[] = router.asPath.split("/")
  const contractAddress = query[2]
  const tokenId = query[3]
  const [resourceInput, setResourceInput] = useState<string>("")
  const [tokenUri, setTokenUri] = useState<string>("")
  const [collectionName, setCollectionName] = useState<string>("")
  const [resources, setResources] = useState<string[]>([])
  const [pendingResources, setPendingResources] = useState<string[]>([])
  const [activeResources, setActiveResources] = useState<string[]>([])
  const [allResourcesData, setAllResourcesData] = useState<string[]>([])
  const [activeResourcesData, setActiveResourcesData] = useState<string[]>([])
  const [pendingResourcesData, setPendingResourcesData] = useState<string[]>([])

  const multiResourceContract = useContract({
    addressOrName: contractAddress as string,
    contractInterface: abis.multiResourceAbi,
    signerOrProvider: provider,
  })

  useEffect(() => {
    console.log("getting " + contractAddress + " data for token id: " + tokenId)
    if (Number(tokenId) >= 0) {
      onFetch()
    }
  }, [contractAddress, tokenId])

  const onFetch = () => {
    fetchSignleNft({ contract: multiResourceContract, tokenId }).then(
      ({
        allData,
        pendingResourcesData,
        activeResourcesData,
        name,
        allResources,
        activeResources,
        pendingResources,
      }) => {
        setCollectionName(name)
        setResources(allResources)
        setActiveResources(activeResources)
        setPendingResources(pendingResources)
        setTokenUri(tokenUri)
        setAllResourcesData(allData)
        setPendingResourcesData(pendingResourcesData)
        setActiveResourcesData(activeResourcesData)
      }
    )
  }

  const onAddResource = () => {
    addResource({
      contract: multiResourceContract,
      addRecentTransaction,
      signer,
      resourceInput,
    }).then(() => {
      onFetch()
    })
  }

  async function setCustomData(id: number) {
    //TODO pass resourceId and customResourceId through the modal here
    if (signer instanceof Signer) {
      // const tx = await multiResourceContract
      //   .connect(signer)
      //   .addCustomDataToResource(resourceId, customResourceId)
      // addRecentTransaction({
      //   hash: tx.hash,
      //   description: "Adding a custom data to resource",
      //   confirmations: 1,
      // })
    }
  }

  const handleResourceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResourceInput(e.target.value)
  }

  return (
    <main className={styles.main}>
      <ConnectButton />

      <h4 className={styles.description}>Collection name: {collectionName}</h4>
      <ul className="mt-1">Usage Notes:</ul>
      <li>
        You have to be the Owner of the NFT or Approved to accept or reject a
        resource
      </li>
      <li>
        You have to be the Owner of the NFT Collection to add new resources
      </li>
      <li>
        If you are not authorized like above the transactions will be reverted
      </li>
      <div className={styles.nft}>
        <p>Token ID: {tokenId}</p>
        <Image
          src={"https://ipfs.io/ipfs/" + tokenUri}
          width={50}
          height={50}
          alt={""}
        />
        <div>
          <h1 className="text-center text-xl mt-5"> Token Active Resources:</h1>
          {activeResources.map((resource, index) => {
            return (
              <div key={index} className={styles.card}>
                <Resource
                  key={index}
                  resource={resource}
                  strings={activeResourcesData}
                  index={index}
                />
              </div>
            )
          })}
          <h1 className="text-center text-xl mt-5">Token Pending Resources:</h1>
          {pendingResources.map((resource, index) => {
            return (
              <div key={index} className={styles.card}>
                <Resource
                  key={index}
                  resource={resource}
                  strings={pendingResourcesData}
                  index={index}
                />
                <button
                  className="btn btn-primary ml-2 "
                  onClick={() => {
                    acceptResource({
                      contract: multiResourceContract,
                      resourceId: index,
                      signer,
                      tokenId,
                      addRecentTransaction,
                    }).then(() => onFetch())
                  }}
                >
                  Accept Resource
                </button>
                <button
                  className="btn btn-secondary ml-1"
                  onClick={() => {
                    rejectResource({
                      contract: multiResourceContract,
                      resourceId: index,
                      signer,
                      tokenId,
                      addRecentTransaction,
                    }).then(() => onFetch())
                  }}
                >
                  Reject Resource
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-center text-2xl mt-10">NFT Collection Resources:</p>
      {resources.map((resourceId, index) => {
        return (
          <div key={index} className={styles.card}>
            <Resource
              key={index}
              resource={resourceId}
              strings={allResourcesData}
              index={index}
            />
            <button
              className="btn btn-primary btn-sm ml-2 "
              onClick={() => {
                addResourceToToken({
                  signer,
                  contract: multiResourceContract,
                  resourceId: Number(resourceId),
                  tokenId,
                  addRecentTransaction,
                }).then(() => onFetch())
              }}
            >
              Add resource to token
            </button>
          </div>
        )
      })}
      <AddResourceToCollection
        value={resourceInput}
        onChange={handleResourceInput}
        onClick={onAddResource}
      />

      <input
        type="checkbox"
        id="add-custom-data-modal"
        className="modal-toggle"
      />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add Custom Data</h3>
          <input
            inputMode="text"
            placeholder="custom data"
            className="input input-bordered w-full max-w-xs mt-5"
            value={resourceInput}
            onChange={handleResourceInput}
          ></input>
          <div className="modal-action">
            <label
              htmlFor="add-custom-data-modal"
              onClick={() => {
                // addCustomData().then(() => fetchNft())
              }}
              className="btn btn-primary"
            >
              Save
            </label>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MultiResourceNft
