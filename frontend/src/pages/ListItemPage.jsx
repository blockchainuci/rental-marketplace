import {
  VStack,
  Text,
  Input,
  Textarea,
  Button,
  Grid,
  Box,
  Image,
  Flex,
  HStack,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ListItemPage() {
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState(Array(4).fill(null));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rentalFee, setRentalFee] = useState("");
  const [collateral, setCollateral] = useState("");
  const [daysLimit, setDaysLimit] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const navigate = useNavigate();
  const fileInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const files = Array.from(e.target.files);
      const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `items/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return getDownloadURL(snapshot.ref);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prevImages) => [...prevImages, ...uploadedUrls]);
    } catch (error) {
      console.error("Error uploading images:", error);
      // Add error handling/notification here
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        // Redirect to login if no user is found
        navigate("/signin");
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Validate required fields
      if (
        !name ||
        !description ||
        !rentalFee ||
        !collateral ||
        !daysLimit ||
        !userEmail
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Create item in database with email
      const response = await axios.post(`http://localhost:3001/items`, {
        name,
        description,
        rental_fee: parseFloat(rentalFee),
        collateral: parseFloat(collateral),
        days_limit: parseInt(daysLimit),
        images,
        email: userEmail,
        status: "Listed",
      });

      alert("Item listed successfully");
      navigate(`/items/${response.data.id}`);
    } catch (error) {
      console.error("Error submitting item:", error);
      alert("Failed to list item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup URLs when component unmounts
      images.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  return (
    <Container maxW="container.md" py={16}>
      <VStack
        spacing={8}
        w="full"
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Heading size="lg" alignSelf="start">
          List Item
        </Heading>

        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <VStack spacing={4} align="start" w="full">
            <Text fontWeight="medium">Images</Text>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              p={1}
            />
            {uploading && <Spinner size="sm" />}
          </VStack>

          {/* Image Preview */}
          {images.length > 0 && (
            <SimpleGrid columns={[2, 3]} spacing={4} my={4}>
              {images.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Preview ${index + 1}`}
                  borderRadius="md"
                  objectFit="cover"
                  boxSize="100px"
                />
              ))}
            </SimpleGrid>
          )}

          {/* Item Details */}
          <VStack spacing={6} w="full">
            <Input
              placeholder="What are you selling?"
              size="lg"
              borderRadius="md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              _placeholder={{ color: "gray.400" }}
            />
            <Textarea
              placeholder="Describe your item (5+ words)"
              minH="120px"
              size="lg"
              borderRadius="md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              _placeholder={{ color: "gray.400" }}
            />
          </VStack>

          {/* Pricing Section */}
          <VStack spacing={6} w="full">
            <Text fontSize="xl" fontWeight="semibold" alignSelf="start">
              Pricing
            </Text>

            <HStack w="full" spacing={4}>
              <Text color="gray.600">$</Text>
              <Input
                type="number"
                placeholder="Set your daily rate"
                size="lg"
                borderRadius="md"
                value={rentalFee}
                onChange={(e) => setRentalFee(e.target.value)}
              />
              <Text color="gray.600">per day</Text>
            </HStack>

            <HStack w="full" spacing={4}>
              <Text color="gray.600">$</Text>
              <Input
                type="number"
                placeholder="Set your Collateral"
                size="lg"
                borderRadius="md"
                value={collateral}
                onChange={(e) => setCollateral(e.target.value)}
              />
            </HStack>

            <Input
              type="number"
              placeholder="Days limit"
              size="lg"
              borderRadius="md"
              value={daysLimit}
              onChange={(e) => setDaysLimit(e.target.value)}
            />
          </VStack>

          {/* Submit Button */}
          <Button
            type="submit"
            w="full"
            size="lg"
            bg="blue.600"
            color="white"
            mt={4}
            borderRadius="md"
            isLoading={isLoading}
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "md",
            }}
          >
            List Item
          </Button>

          {isLoading && <Spinner color="blue" size="lg" />}
        </form>
      </VStack>
    </Container>
  );
}

export default ListItemPage;
