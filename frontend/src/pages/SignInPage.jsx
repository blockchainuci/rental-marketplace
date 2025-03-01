import { VStack, Text, Input, Button, Container, Link, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useBreakpointValue } from "@chakra-ui/react";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      console.error("Error signing in:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW={useBreakpointValue({ base: "container.xs", md: "container.sm" })} 
      py={16}
      h="100vh"
      display="flex"
      alignItems="center"
      mt="-10vh"
    >
      <VStack
        spacing={useBreakpointValue({ base: 4, md: 8 })}
        w={useBreakpointValue({ base: "full", md: "500px"})}
        bg="white"
        mx="auto"
        p={useBreakpointValue({ base: 4, md: 8})}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Text fontSize={useBreakpointValue({ base: 'xl', md: "2xl" })} fontWeight="bold">
          Sign In
        </Text>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>

        <Flex justify="center"><Button
              type="submit"
              colorScheme="blue"
              size={useBreakpointValue({ base: "md", md: "lg" })}
              maxW={useBreakpointValue({ base: "15rem", md: "20rem" })}
              isLoading={isLoading}
            > 
            <FcGoogle/>
              {useBreakpointValue({ base: "UCI SSO", md: "Sign in with UCI SSO" })}
            </Button></Flex>
  
        </form>

        <hr style={{ width: "100%", margin: "1rem 0" }} />

        <VStack spacing={2}>
          <Text>Don't have an account?</Text>
          <Link color="blue.500" onClick={() => navigate("/signup")}>
            {useBreakpointValue({ base: "Sign Up", md: "Create an Account" })}
          </Link>
        </VStack>
      </VStack>
    </Container>
  );
}

export default SignInPage;
