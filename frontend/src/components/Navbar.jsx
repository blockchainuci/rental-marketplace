import { HStack, Button, Flex, Icon, Text, Image, Box } from "@chakra-ui/react";
import { ColorModeButton } from "./ui/color-mode";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { MdAdd, MdLogout, MdLogin, MdPerson } from "react-icons/md";
import NavBarMenu from "./NavBarMenu";
import { useBreakpointValue } from "@chakra-ui/react";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const NavButton = ({
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
      borderRadius="xl"
      size="md"
      color={color}
      _hover={{ bg: `${colorScheme}.50` }}
      minW={{ base: '40px', md: 'auto' }}
      p={{ base: '2', md: '4' }}
      gap={2}
    >
      <Box as={icon} boxSize={5} />
      {useBreakpointValue({ base: '', md: label })}
    </Button>
  );

  return (
    <Flex
      as="nav"
      justify="space-between"
      align="center"
      w="full"
      position="fixed"
      top={0}
      zIndex={1}
      bg="white"
      boxShadow="md"
      h={16}
      px={{ base: 2, md: 4 }}
    >
      {/* Left Side */}
      <Box flex="0 1 auto">
        <NavButton
          icon={MdAdd}
          label="List Item"
          onClick={() => navigate("/list")}
          colorScheme="blue.200"
          color="black"
          variant="ghost"
          border="none"
        />
      </Box>

      {/* Center - logo stays centered */}
      <Box position="absolute" left="50%" transform="translateX(-50%)" zIndex={2}>
        <Image
          src="/ih_logo.png"
          alt="Logo"
          h="70px"
          cursor="pointer"
          onClick={() => navigate("/")}
        />
      </Box>

      {/* Right Side */}
      <Box 
        flex="0 1 auto" 
        maxW={{ base: '120px', md: '200px' }} 
        overflow="hidden"
        whiteSpace="nowrap"
        textOverflow="ellipsis"
      >
        {user ? (
          <NavBarMenu />
        ) : (
          <NavButton
            icon={MdLogin}
            label="Sign In"
            onClick={() => navigate("/signin")}
            colorScheme="green"
          />
        )}
      </Box>
    </Flex>
  );
};

export default Navbar;