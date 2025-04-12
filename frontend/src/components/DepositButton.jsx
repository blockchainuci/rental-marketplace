import React from 'react';
import { Button } from '@chakra-ui/react';
import { MdDownload } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const DepositButton = () => {
  const navigate = useNavigate();

  const handleDeposit = async () => {
    // Parameters to configure ZKP2P flow
    const referrer = "YourAppName";
    const referrerLogo = "https://example.com/your-app-logo.svg"; // Optional
    const callbackUrl = "https://yourapp.com/success"; // Where users are redirected after a successful deposit
    const inputCurrency = "USD"; // Input currency user will swap from (USD, EUR, etc.)
    const inputAmount = 100; // Amount the user wants to swap
    const toToken = "USDC"; // Token user wants to receive
    const recipientAddress = "0xD21134fAfe0729F487d9c91cD9f9977C39FB01ED"; // Your wallet address

    // Build the ZKP2P URL
    const zkp2pUrl = `https://zkp2p.xyz/swap?referrer=${referrer}&referrerLogo=${referrerLogo}&callbackUrl=${callbackUrl}&inputCurrency=${inputCurrency}&inputAmount=${inputAmount}&toToken=${toToken}&recipientAddress=${recipientAddress}`;

    // Redirect user to ZKP2P
    window.location.href = zkp2pUrl;
  };

  return (
    <Button
      leftIcon={<MdDownload />}
      onClick={handleDeposit}
      colorScheme="blue"
      variant="solid"
    >
      Deposit
    </Button>
  );
};

export default DepositButton;