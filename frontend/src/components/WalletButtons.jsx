import { useState, useEffect } from "react";
import { connectWallet } from "../wallet/wallet.js";
import {  
    Button, 
    Flex,
    Text,
    Box
  } from "@chakra-ui/react";
  import {
    MdWallet,
    MdUpload,
    MdDownload
  } from "react-icons/md";
import MenuButton from "./ui/menu-button";

function WalletButton() {
    const [account, setAccount] = useState(false);

      // TO DO: get blockchain data
      const [ethBalance, setEthBalance] = useState(0.0);
      const [priceOfOneEthereumInUSD, setPriceOfOneEthereumInUSD] = useState(2675.49);


      useEffect(() => {
        async function autoConnectWallet() {
            try {
                const accounts = await connectWallet();
                if (accounts && accounts.length > 0) {
                    setAccount(accounts[0]); // Set the first account
                    console.log("Auto-connected to:", accounts[0]);
                }
            } catch (error) {
                console.error("Auto-connect error:", error);
            }
        }
        autoConnectWallet();
    }, []); 

    const handleConnect = async () => {
        const accounts = await connectWallet();
        if (accounts && accounts.length > 0) {
            setAccount(accounts[0]); // Set the first account
        }
    };

    const handleDepositClick = () => {
        console.log("deposit click");
    };

    const handleWithdrawClick = () => {
        console.log("withdraw click");
    };

    return (
        <div>
            {account ? (
                <div>
                    <Flex
                        direction="column"
                        align="center">
                        <Flex   
                            align="center" 
                            gap={2}
                            justifyContent="center"
                            mt = "7vh">  
                            <MdWallet size={24} />
                            <Text>{account.replace(/^(.{3}).*(.{3})$/, "$1...$2")}</Text>
                        </Flex>
                    
                            <Text>${Number(ethBalance*priceOfOneEthereumInUSD).toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2
                            })}</Text>
                      

                            <Flex
                                direction="column"
                                gap={4}
                                mt={4}>
                                  <MenuButton icon={MdDownload} label="Deposit" onClick={handleDepositClick} />
                                  <MenuButton icon={MdUpload} label="Withdraw" onClick={handleWithdrawClick} />
                            </Flex>
                    </Flex>
                </div>
            ) : (
                <Flex
                direction="column"
                align="center"
                mt = "10vh">
                    <Button onClick={handleConnect}>
                        {account ? `Connected: ${account}` : "Connect Wallet"}
                    </Button>
                </Flex>
            )}

        </div>
    );
}

export default WalletButton;