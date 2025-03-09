import { HStack, Button, Flex, Icon, Text, Image, Box, useBreakpointValue } from "@chakra-ui/react";
import { ColorModeButton } from "./ui/color-mode";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { MdAdd, MdLogout, MdLogin, MdPerson } from "react-icons/md";
import NavBarMenu from "./NavBarMenu";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Add breakpoint values
  const showLabels = useBreakpointValue({ base: false, md: true });
  const logoHeight = useBreakpointValue({ base: "70px", sm: "70px", md: "70px" });  // Changed from 0px to 35px for base
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });
  const navPadding = useBreakpointValue({ base: 2, md: 4 });

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
      size={buttonSize}
      color={color}
      _hover={{ bg: `${colorScheme}.50` }}
    >
      <Box as={icon} boxSize={5} />
      {showLabels && label}
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
      px={navPadding}
    >
      {/* Left Side */}
      <Box minW={showLabels ? "120px" : "40px"}>
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

      {/* Center - Absolute positioning for true center */}
      <Box position="absolute" left="50%" transform="translateX(-50%)" zIndex={0}>
        <Image
          src="/ih_logo.png"
          alt="Logo"
          h={logoHeight}
          cursor="pointer"
          onClick={() => navigate("/")}
        />
      </Box>

      {/* Right Side */}
      <Box minW={showLabels ? "120px" : "40px"}>
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
