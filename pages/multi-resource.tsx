import { ConnectButton, useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import type { NextPage } from "next"
import Head from "next/head"
import styles from "../styles/Home.module.css"
import { rmrkFactoryContract, rmrkMultiResourceContract } from "../constants"
import { useAccount, useProvider, useSigner } from "wagmi"
import { Contract, Signer } from "ethers"
import NftList from "./nft-list"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

const MultiResource: NextPage = () => {
  const provider = useProvider()
  const { data: signer, isSuccess } = useSigner()
  const { address, isConnected } = useAccount()
  const addRecentTransaction = useAddRecentTransaction()
  let multiResourceContract: Contract
  const [currentRmrkDeployment, setCurrentRmrkDeployment] = useState<string>("")
  const [rmrkCollections, setRmrkCollections] = useState<string[]>([])
  const [nameInput, setNameInput] = useState<string>("Test Collection")
  const [symbolInput, setSymbolInput] = useState<string>("TEST")
  const [maxSupplyInput, setSupplyInput] = useState<number>(10000)
  const [priceInput, setPriceInput] = useState<number>(0)
  const [ownedNfts, setOwnedNfts] = useState<
    { tokenId: number; owner: string; tokenUri: string }[]
  >([])

  function handleNameInput(e: React.ChangeEvent<HTMLInputElement>) {
    setNameInput(e.target.value)
  }

  function handleSymbolInput(e: React.ChangeEvent<HTMLInputElement>) {
    setSymbolInput(e.target.value)
  }

  function handleMaxSupplyInput(e: React.ChangeEvent<HTMLInputElement>) {
    setSupplyInput(e.target.valueAsNumber)
  }

  function handlePriceInput(e: React.ChangeEvent<HTMLInputElement>) {
    setPriceInput(e.target.valueAsNumber)
  }

  function handleContractSelection(e: React.ChangeEvent<HTMLInputElement>) {
    setCurrentRmrkDeployment(rmrkCollections[Number(e.target.value)])
  }

  async function getOwnedNfts() {
    const nfts = []

    if (signer instanceof Signer) {
      multiResourceContract = new Contract(
        currentRmrkDeployment,
        rmrkMultiResourceContract.contractInterface,
        signer
      )
      const nftSupply = await multiResourceContract.totalSupply()
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
    }
    return nfts
  }

  async function mintNft() {
    if (signer instanceof Signer) {
      multiResourceContract = new Contract(
        currentRmrkDeployment,
        rmrkMultiResourceContract.contractInterface,
        signer
      )

      const tx = await multiResourceContract
        .connect(signer)
        .mint(await signer.getAddress(), 1)

      addRecentTransaction({
        hash: tx.hash,
        description: "Minting a new RMRK NFT",
        confirmations: 1,
      })
    }
  }

  async function deployNft() {
    if (signer instanceof Signer) {
      const factoryContract = new Contract(
        rmrkFactoryContract.addressOrName,
        rmrkFactoryContract.contractInterface,
        signer
      )

      const tx = await factoryContract
        .connect(signer)
        .deployRMRKMultiResource(
          nameInput,
          symbolInput,
          maxSupplyInput,
          priceInput
        )

      addRecentTransaction({
        hash: tx.hash,
        description: "Deploying a new RMRK NFT contract",
        confirmations: 1,
      })

      const receipt = await tx.wait()
      setCurrentRmrkDeployment(receipt.events[1].args[0])
    }
  }

  async function queryCollections() {
    if (signer instanceof Signer) {
      const factoryContract = new Contract(
        rmrkFactoryContract.addressOrName,
        rmrkFactoryContract.contractInterface,
        signer
      )

      let fromBlock = 2550593 // contract creation block
      const events = await factoryContract.queryFilter(
        factoryContract.filters.NewRMRKMultiResourceContract(
          null,
          await signer.getAddress()
        ),
        fromBlock,
        "latest"
      )
      let collections: string[] = []
      events.map((e) => {
        collections.push(e.args?.[0])
      })
      setRmrkCollections(collections)
    }
  }

  useEffect(() => {
    console.log("Loading chain data")
    queryCollections().then((r) => {})
    if (currentRmrkDeployment.length > 0)
      getOwnedNfts().then((nfts) => {
        setOwnedNfts(nfts)
      })
  }, [signer, currentRmrkDeployment])

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

        <p className="mb-4">
          Create a new NFT collection contract so you can add your own set of
          resources to it:
        </p>

        <div className="form-control w-full max-w-xs mb-2">
          <label className="label">
            <span className="label-text">Collection Name</span>
          </label>
          <input
            inputMode="text"
            placeholder="Name"
            className="input input-bordered w-full max-w-xs my-0.5"
            value={nameInput}
            onChange={handleNameInput}
          ></input>
          <label className="label">
            <span className="label-text">Collection Symbol</span>
          </label>
          <input
            inputMode="text"
            placeholder="Symbol"
            className="input input-bordered w-full max-w-xs my-0.5"
            value={symbolInput}
            onChange={handleSymbolInput}
          ></input>
          <label className="label">
            <span className="label-text">Max NFT Supply</span>
          </label>
          <input
            inputMode="numeric"
            placeholder="Max supply"
            className="input input-bordered w-full max-w-xs my-0.5"
            value={maxSupplyInput}
            onChange={handleMaxSupplyInput}
          ></input>
          <label className="label">
            <span className="label-text">Price per NFT mint (in wei)</span>
          </label>
          <input
            inputMode="numeric"
            placeholder="Price"
            className="input input-bordered w-full max-w-xs my-0.5"
            value={priceInput}
            onChange={handlePriceInput}
          ></input>
        </div>

        <button
          onClick={() => {
            deployNft().then((r) => getOwnedNfts())
          }}
          className="btn btn-wide btn-primary"
        >
          Deploy NFT contract
        </button>

        <p className="mt-5">
          Your RMRK NFT Contract will be deployed on the Moonbase Alpha testnet.{" "}
        </p>

        {rmrkCollections.length > 0 && (
          <>
            <h1 className="text-2xl mt-8 mb-5">Your RMRK NFT Collections:</h1>
            <p className="mb-2">Select which one do you want to use:</p>
            {rmrkCollections?.map((contract, index) => {
              return (
                <div
                  key={index}
                  className="card-compact hover:bg-accent-content/5"
                >
                  <input
                    type="radio"
                    name="radio-contract"
                    className="radio checked:bg-red-500"
                    value={index}
                    onChange={handleContractSelection}
                  />

                  <Link href={"/contract/" + contract}>
                    <code className="mx-2 hover:underline">{contract}</code>
                  </Link>
                  <a href={"https://moonbase.moonscan.io/address/" + contract}>
                    <Image
                      alt="logo"
                      src="/moonbeam.svg"
                      width="25"
                      height="25"
                    />
                  </a>
                </div>
              )
            })}
          </>
        )}

        {currentRmrkDeployment.length > 0 && (
          <>
            <p className="mb-4 mt-5">
              Mint an NFT to be able to attach multiple resources to it:
            </p>
            <button
              onClick={() => {
                mintNft().then((r) => getOwnedNfts())
              }}
              className="btn btn-wide btn-primary"
            >
              Mint NFT
            </button>
            <p className="mt-5">
              It might take a few minutes to show your NFTs when just minted.
            </p>
            <p className="mb-5">
              Click on the NFT card to open resource management page.
            </p>
            <NftList nfts={ownedNfts} tokenContract={currentRmrkDeployment} />
          </>
        )}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  )
}

export default MultiResource
