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
    MdDownload,
    MdList
  } from "react-icons/md";
import MenuButton from "./ui/menu-button";
import { getUserUSDCBalance } from "../wallet/wallet.js";
import { useNavigate } from "react-router-dom";

function WalletButton() {
    const [account, setAccount] = useState(null);

      const [usdcBaseBalance, setUsdcBaseBalance] = useState(0.0);
      const navigate = useNavigate();
      
      useEffect(() => {
        async function autoConnectWallet() {
            try {
                const accounts = await connectWallet();
                if (accounts && accounts.length > 0) {
                    setAccount(accounts[0]); // Set the first account
                }
            } catch (error) {
                console.error("Auto-connect error:", error);
            }
        }
        autoConnectWallet();
    }, []); 

    useEffect(() => {
        if (account) {

            // Define an async function inside useEffect
            const fetchBalance = async () => {
                const balance = await getUserUSDCBalance();
                setUsdcBaseBalance(balance);
            };

            fetchBalance(); // Call the async function
        }
    }, [account]);

    const handleConnect = async () => {
        const accounts = await connectWallet();
        if (accounts && accounts.length > 0) {
            setAccount(accounts[0]); // Set the first account
        }
    };

    const handleTransactionsClick = () => {
        navigate("/transactions");
    };

    const handleDepositClick = () => {
        navigate("/deposit");
    };

    const handleWithdrawClick = () => {
        navigate("/withdraw");
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
                    
                            <Text>${Number(usdcBaseBalance).toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2
                            })}</Text>
                      

                            <Flex
                                direction="column"
                                gap={4}
                                mt={4}>
                                  <MenuButton icon={MdDownload} label="Deposit" onClick={handleDepositClick} />
                                  <MenuButton icon={MdUpload} label="Withdraw" onClick={handleWithdrawClick} />
                                  <MenuButton icon={MdList} label="Transactions" onClick={handleTransactionsClick} />
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