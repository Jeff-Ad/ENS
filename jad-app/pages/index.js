import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { ethers, providers } from "ethers";
import React from "react";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = React.useState(false);

  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = React.useRef();

  // ENS
  const [ens, setEns] = React.useState("");

  // Save the address of the currently connected account
  const [address, setAddress] = React.useState("");

  /**
   * Sets the ENS, if the current connected address has an associated ENS or else it sets
   * the address of the connected account
   */
  const setENSOrAddress = async (address, web3Provider) => {
    // looks up the ENS related to the given address
    let _ens = await web3Provider.lookupAddress(address);
    // if the address has an ENS => set the ENS or just set the address
    if (_ens) {
      setEns(_ens);
    } else {
      setAddress(address);
    }
  };

  const getProviderOrSigner = async () => {
    /**
     * connect to MetaMask
     *
     * Since we store 'web3Modal' as a reference, we need to access
     * the 'current' value to get access to the underlying obj
     */
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    // if user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }
    const signer = web3Provider.getSigner();
    // Get the address associated to the signer which is connected to MetaMask
    const address = await signer.getAddress();
    // Calls the function to set the ENS or Address
    await setENSOrAddress(address, web3Provider);
    return signer;
  };

  /**
   * Connect wallet to MetaMask
   */
  const connectWallet = async () => {
    try {
      //Get the provier from web3Modal, which in our case is MetaMask

      await getProviderOrSigner(true);
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Returns a button based on the state if the dApp
   */
  const renderButton = () => {
    if (walletConnected) {
      <div>Wallet connected</div>;
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  React.useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);
  return (
    <div>
      <Head>
        <title>ENS Dapp</title>
        <meta name="description" content="ENS-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome to LearnWeb3 Punks {ens ? ens : address}!
          </h1>
          <div className={styles.description}>
            Its an NFT collection for LearnWeb3 Punks.
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./learnweb3punks.png" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by LearnWeb3 Punks
      </footer>
    </div>
  );
}
