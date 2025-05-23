import { Flex, Icon, Text, VStack, Box, Badge } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdHome,
  MdShoppingCart,
  MdStore,
  MdReceipt,
  MdBook,
  MdMessage,
} from "react-icons/md";
import { auth } from "../firebase";
import { useState, useEffect } from "react";
import axios from "axios";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadMessage(user.email);
    }
  }, [user]);

  const fetchUnreadMessage = async (currentUserEmail) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOSTNAME}/messages/has_unread_message/${currentUserEmail}`);
      setHasUnreadMessage(response.data.hasUnread)
    } catch (error) {
      console.error("Error fetching item:", error);
    }
  };

  const NavItem = ({ icon, label, path }) => (
    <VStack
      spacing={1}
      cursor="pointer"
      onClick={() => navigate(path)}
      color={location.pathname === path ? "blue.500" : "gray.500"}
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)" }}
    >
      <Box position="relative">
        <Icon as={icon} boxSize={6} />
        {icon === MdMessage && hasUnreadMessage && (
          <Box
            position="absolute"
            top="0"
            right="0"
            w="12px"
            h="12px"
            bg="red.500"
            borderRadius="full"
          />
        )}
      </Box>
      <Text fontSize="xs" fontWeight="medium">
        {label}
      </Text>
    </VStack>
  );

  return (
    <Flex
      as="footer"
      justify="space-around"
      align="center"
      w="full"
      position="fixed"
      bottom={0}
      bg="white"
      p={4}
      boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
      h={20}
    >
      <NavItem icon={MdHome} label="Home" path="/" />
      <NavItem icon={MdShoppingCart} label="Rentals" path="/rent" />
      <NavItem icon={MdStore} label="Listings" path="/lend" />
      <NavItem icon={MdReceipt} label="Ledger" path="/ledger" />
      <NavItem icon={MdMessage} label="Messages" path="/messages" />
    </Flex>
  );
};

export default Footer;
