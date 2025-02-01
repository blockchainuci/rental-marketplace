import { Flex, Icon, Text, VStack } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdHome,
  MdShoppingCart,
  MdStore,
  MdReceipt,
  MdBook,
} from "react-icons/md";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const NavItem = ({ icon, label, path }) => (
    <VStack
      spacing={1}
      cursor="pointer"
      onClick={() => navigate(path)}
      color={location.pathname === path ? "blue.500" : "gray.500"}
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)" }}
    >
      <Icon as={icon} boxSize={6} />
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
      <NavItem icon={MdShoppingCart} label="My Rentals" path="/rent" />
      <NavItem icon={MdStore} label="My Listings" path="/lend" />
      <NavItem icon={MdReceipt} label="Ledger" path="/ledger" />
      <NavItem icon={MdBook} label="Learn" path="/learn" />
    </Flex>
  );
};

export default Footer;
