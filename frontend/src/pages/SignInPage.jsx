import { VStack, Text, Input, Button, Container, Link } from "@chakra-ui/react";
import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      console.error("Error signing in:", error);
      setError(error.message);
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
          Sign In
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
              Sign In
            </Button>
          </VStack>
        </form>

        <hr style={{ width: "100%", margin: "1rem 0" }} />

        <VStack spacing={2}>
          <Text>Don't have an account?</Text>
          <Link color="blue.500" onClick={() => navigate("/signup")}>
            Sign Up
          </Link>
        </VStack>
      </VStack>
    </Container>
  );
}

export default SignInPage;
