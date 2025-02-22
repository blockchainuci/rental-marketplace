import {  
  Button, 
  Flex, 
  Text, 
  Box
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { 
  useState, 
  useEffect 
} from "react";
import { 
  MdLogout, 
  MdPerson 
} from "react-icons/md";
import {
  MdClose,
  MdBook,
  MdWallet
} from "react-icons/md";
import { useBreakpointValue } from "@chakra-ui/react";

const NavBarMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Move all breakpoint values to the top
  const menuWidth = useBreakpointValue({ base: '80vw', sm: '60vw', md: '40vw', lg: '30vw' });
  const buttonLabel = useBreakpointValue({ base: '', md: user?.email?.replace(/@.*/, "") });

  // TO DO: get blockchain data
  const [walletAddress, setWalletAddress] = useState("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
  const [ethBalance, setEthBalance] = useState(0.00037);
  const [priceOfOneEthereumInUSD, setPriceOfOneEthereumInUSD] = useState(2675.49);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      setIsOpen(false);
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleMenuClick = () => {
    try {
      setIsOpen(!isOpen);
    } catch (error) {
      console.error("Error with menu", error);
    }
  };

  const handleLearnClick = () => {
    try {
      setIsOpen(false);
      navigate("/learn");
    } catch (error) {
      console.error("Error with learn button", error);
    }
  };
  

  const IconButton = ({
    icon,
    label,
    onClick,
    colorScheme = "white",
    color = "black",
    variant = "ghost",
    iconSize = 8
  }) => (
    <Button
      onClick={onClick}
      bg={colorScheme}
      variant= {variant}
      border = "none"
      borderRadius="xl"
      size="xl"
      color={color}
      _hover={{ bg: `${colorScheme}.50` }}
    >
      <Box as={icon} boxSize={iconSize} />
      {label}
    </Button>
  );


  // Update just the MenuButton component
  // Update MenuButton to receive label directly
  const MenuButton = ({
    icon,
    label,
    onClick,
    colorScheme = "white",
    color = "black",
  }) => (
    <Button
      onClick={onClick}
      bg={colorScheme}
      variant="outline"
      borderRadius="lg"
      size={useBreakpointValue({ base: 'sm', md: 'md'})}
      color={color}
      _hover={{ bg: `${colorScheme}.50` }}
      minW={{ base: '35px', md: 'auto' }}
      p={{ base: '1', md: '3' }}
    >
      <Box as={icon} boxSize={4}/>
      {label}
    </Button>
  );

  if (!user) {
    return;
  }

  return (
    <>
      {/* Button to toggle the menu */}
      <MenuButton 
        icon={MdPerson} 
        label={buttonLabel} 
        onClick={handleMenuClick} 
      />
      
      {/* Overlay that closes the menu when clicked */}
      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          zIndex={10}
          onClick={handleMenuClick} // Clicking outside closes menu
        />
      )}

      {/* Sliding Menu */}
      <Box
        position="fixed"
        top="0"
        right="0"
        height="100vh"
        width={menuWidth}
        bg="white"
        boxShadow="xl"
        transition="transform 0.3s ease-in-out"
        transform={isOpen ? "translateX(0)" : "translateX(100%)"}
        zIndex={20} // Ensures menu is above overlay
      >

        <IconButton
          icon={MdClose}
          colorScheme="white.200"
          color="black"
          variant="ghost"
          border="none"
          onClick={handleMenuClick}
          _hover={{ bg: "gray.200" }}
        />

        <Box p={4}>
          <Flex 
            align="center" 
            gap={2}
            justifyContent="center"
            mb={2}>  
            <MdPerson size={24} /> 
            <Text>{user.email.replace(/@.*/, "")}</Text>
          </Flex>
          <hr/>

          <Flex
          direction="column"
          align="center">
            <Flex   
              align="center" 
              gap={2}
              justifyContent="center"
              mt = "10vh">  
              <MdWallet size={24} />
              <Text>{walletAddress.replace(/^(.{3}).*(.{3})$/, "$1...$2")}</Text>

            </Flex>
            <Text>${Number(ethBalance*priceOfOneEthereumInUSD).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2
              })}</Text>
          </Flex>


          <Flex
            direction="column"
            gap={4}
            height="100vh"
            mt="10vh">
            <hr/>
            <MenuButton icon={MdBook} label="Learn" onClick={handleLearnClick} />
            <MenuButton icon={MdLogout} label="Sign Out" onClick={handleSignOut} />
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default NavBarMenu;
