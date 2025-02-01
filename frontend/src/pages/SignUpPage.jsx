import { VStack, Text, Input, Button, Container, Link } from "@chakra-ui/react";
import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

      // Then, add user to your database using axios
      await axios.post("http://localhost:3001/users", {
        email: email,
        wallet_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Hard-coded wallet address
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
          <VStack spacing={4} w="full">
            <VStack w="full" align="flex-start">
              <Text>Email</Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </VStack>

            <VStack w="full" align="flex-start">
              <Text>Password</Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </VStack>

            <VStack w="full" align="flex-start">
              <Text>Confirm Password</Text>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              {error && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}
            </VStack>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              w="full"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </VStack>
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
