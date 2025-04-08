import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Head from "next/head";
import WalletConnectProvider from "@walletconnect/web3-provider";

const CONTRACT_ADDRESS = "0xd7921f17F11f6897150c100d3d4d433Ad723Ff2B";
const CONTRACT_ABI = [
  "function interact() external",
  "function hasClaimed(address) view returns (bool)"
];

export default function Home() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);

  const connectWallet = async (type) => {
    setLoading(true);
    try {
      let web3Provider;
      if (type === "metamask" && window.ethereum) {
        web3Provider = new ethers.BrowserProvider(window.ethereum);
        await web3Provider.send("eth_requestAccounts", []);
      } else if (type === "walletconnect") {
        const wcProvider = new WalletConnectProvider({
          rpc: {
            10218: "https://rpc.testnet.tea.xyz"
          },
        });
        await wcProvider.enable();
        web3Provider = new ethers.BrowserProvider(wcProvider);
      } else {
        alert("Wallet tidak tersedia.");
        setLoading(false);
        return;
      }

      const signer = await web3Provider.getSigner();
      const userAddress = await signer.getAddress();
      const onetContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const isClaimed = await onetContract.hasClaimed(userAddress);

      setAccount(userAddress);
      setContract(onetContract);
      setClaimed(isClaimed);
      setProvider(web3Provider);
    } catch (err) {
      alert("Gagal koneksi wallet: " + err.message);
    }
    setLoading(false);
  };

  const handleClaim = async () => {
    if (!contract) return;
    try {
      const tx = await contract.interact();
      await tx.wait();
      setClaimed(true);
      alert("Airdrop berhasil diklaim!");
    } catch (err) {
      alert("Gagal klaim: " + err.message);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f9fafb",
      fontFamily: "sans-serif",
      padding: "20px"
    },
    card: {
      backgroundColor: "#ffffff",
      padding: "32px",
      borderRadius: "16px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "400px",
      textAlign: "center"
    },
    button: {
      padding: "12px",
      marginTop: "20px",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      width: "100%",
      fontWeight: "bold"
    },
    text: {
      fontSize: "14px",
      color: "#333"
    },
    success: {
      color: "green",
      fontWeight: "bold"
    },
    error: {
      color: "red"
    }
  };

  return (
    <>
      <Head>
        <title>ONET Airdrop</title>
        <meta name="description" content="Klaim token kucing ONET gratis di jaringan Tea Sepolia" />
      </Head>
      <main style={styles.container}>
        <div style={styles.card}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Airdrop Token ONET</h1>
          {loading ? (
            <p>Memuat...</p>
          ) : account ? (
            <>
              <p style={styles.text}>Akun: {account}</p>
              {claimed ? (
                <p style={styles.success}>Anda sudah klaim ONET.</p>
              ) : (
                <button onClick={handleClaim} style={styles.button}>
                  Klaim Sekarang
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => connectWallet("metamask")} style={styles.button}>
                Connect with MetaMask
              </button>
              <button onClick={() => connectWallet("walletconnect")} style={{ ...styles.button, marginTop: "10px", backgroundColor: "#10b981" }}>
                Connect with WalletConnect
              </button>
            </>
          )}
        </div>
      </main>
    </>
  );
}
