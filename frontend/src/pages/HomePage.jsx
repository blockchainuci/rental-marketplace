import { Flex, Button, Box } from "@chakra-ui/react";
import SearchBar from "../components/SearchBar";
import CardBox from "../components/CardBox";

const HomePage = () => {
  return (
    <Flex direction="column" align="center" py={16} mb={16}>
      <Box 
        w="full" 
        maxW={{ base: "100%", md: "90%", lg: "80%" }} 
        px={{ base: 4, md: 8 }}
        py={6}
        borderRadius="lg"
        bg="white" 
        boxShadow="lg"
        >
          <Box mt={6}>
            <CardBox />
          </Box>
      </Box>
    </Flex>
  );
};

export default HomePage;
