import { VStack, Text, Input, Button, Container, Link, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getBearerToken } from "../contexts/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { provider } from "../firebase";

function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // First, create the Firebase auth user
      await createUserWithEmailAndPassword(auth, email, password);
      const token = await getBearerToken();
      const result = await signInWithPopup(auth, provider);

      // Then, add user to your database using axios
      await axios.post("http://localhost:3001/users", {
        email: email,
        wallet_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Hard-coded wallet address
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      navigate("/");
    } catch (error) {
      console.error("Error signing up:", error);
      setError(error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={16}>
      <VStack
        spacing={8}
        w="full"
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Text fontSize="2xl" fontWeight="bold">
          Sign Up
        </Text>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>

            <Flex justify="center"><Button
              type="submit"
              colorScheme="blue"
              size="lg"
              maxW="20rem"
              isLoading={isLoading}
            >
              <FcGoogle/>
              Sign up with UCI
            </Button></Flex>
        </form>

        <hr style={{ width: "100%", margin: "1rem 0" }} />

        <VStack spacing={2}>
          <Text>Already have an account?</Text>
          <Link color="blue.500" onClick={() => navigate("/signin")}>
            Sign In
          </Link>
        </VStack>
      </VStack>
    </Container>
  );
}

export default SignUpPage;
