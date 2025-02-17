import { HStack, Button, Flex, Icon, Text, Image, Box } from "@chakra-ui/react";
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
          colorScheme="blue.200"
          color="black"
          variant="ghost"
          border="none"
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
          <NavBarMenu/>
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
