import { HStack, Button, Flex, Icon, Text, Image, Box } from "@chakra-ui/react";
import { ColorModeButton } from "./ui/color-mode";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { MdAdd, MdLogout, MdLogin } from "react-icons/md";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
    >
      <Box as={icon} boxSize={5} />
      {label}
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
      px={4}
    >
      {/* Left Side */}
      <Box>
        <NavButton
          icon={MdAdd}
          label="List Item"
          onClick={() => navigate("/list")}
          colorScheme="blue.600"
          color="white"
        />
      </Box>

      {/* Center */}
      <Image
        src="/ih_logo.png"
        alt="Logo"
        h="70px"
        cursor="pointer"
        onClick={() => navigate("/")}
      />

      {/* Right Side */}
      <Box>
        {user ? (
          <NavButton icon={MdLogout} label="Sign Out" onClick={handleSignOut} />
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
