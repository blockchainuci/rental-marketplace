import {  
  Button, 
  Flex, 
  Text, 
  Box,
  useBreakpointValue
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
  MdWallet,
  MdArrowBack
} from "react-icons/md";
import WalletButtons from "./WalletButtons";
import MenuButton from "./ui/menu-button";
import WithdrawPage from "../pages/WithdrawPage";

const NavBarMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  // Move all breakpoint values to the top
  const menuWidth = useBreakpointValue({ base: '80vw', sm: '60vw', md: '40vw', lg: '30vw' });
  const buttonLabel = useBreakpointValue({ base: '', md: user?.email?.replace(/@.*/, "") });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleBackToWallet = () => {
    setShowWithdraw(false);
  }

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



  if (!user) {
    return;
  }

  return (
    <>
      {/* Button to toggle the menu */}
      <MenuButton icon={MdPerson} label={user.email.replace(/@.*/, "")} onClick={handleMenuClick} />

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
        width="40vw"
        bg="white"
        boxShadow="xl"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        transform={isOpen ? "translateX(0)" : "translateX(100%)"}
        opacity={isOpen ? 1 : 0}
        zIndex={20}
      >
        <Box p={4}>
          {showWithdraw ? (
            <IconButton
              icon={MdArrowBack}
              colorScheme="white.200"
              color="black"
              variant="ghost"
              border="none"
              onClick={handleBackToWallet}
              _hover={{ bg: "gray.200" }}
            />
          ) : (
            <IconButton
              icon={MdClose}
              colorScheme="white.200"
              color="black"
              variant="ghost"
              border="none"
              onClick={handleMenuClick}
              _hover={{ bg: "gray.200" }}
            />
          )}
        </Box>

        {/* Profile animation */}
        <Box p={4}>
          <Flex 
            align="center" 
            gap={2}
            justifyContent="center"
            mb={4}
            opacity={isOpen ? 1 : 0}
            transform={isOpen ? "translateY(0)" : "translateY(-20px)"}
            transition="all 0.3s ease-in-out"
          >  
            <MdPerson size={24} /> 
            <Text>{user.email.replace(/@.*/, "")}</Text>
          </Flex>
          <hr/>

          {showWithdraw ? (
            <WithdrawPage/>
          ) : (
            <WalletButtons onWithdrawClick={() => setShowWithdraw(true)} />
          )}

          <Flex
            direction="column"
            gap={4}
            height="100vh"
            mt="7vh">
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
