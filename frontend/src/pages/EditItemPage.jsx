import {
  VStack,
  Text,
  Input,
  Textarea,
  Button,
  Image,
  Flex,
  HStack,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../firebase";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditItemPage() {
  const { id } = useParams();
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
  const [fetchLoading, setFetchLoading] = useState(true);

  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOSTNAME}/items/${id}`);
        const item = response.data;
        
        //populate all fields with existing data so user knows what they're editing
        setName(item.name);
        setDescription(item.description);
        setRentalFee(item.rental_fee.toString());
        setCollateral(item.collateral.toString());
        setDaysLimit(item.days_limit.toString());
        setImages(item.images);
      } catch (error) {
        console.error("Error fetching item:", error);
        alert("Error loading item data");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
      setImages(uploadedUrls);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (!name || !description || !rentalFee || !collateral || !daysLimit || !userEmail) {
        alert("Please fill in all required fields");
        return;
      }


      await axios.put(`${process.env.REACT_APP_BACKEND_HOSTNAME}/items/${id}`, {
        name,
        description,
        rental_fee: parseFloat(rentalFee),
        collateral: parseFloat(collateral),
        days_limit: parseInt(daysLimit),
        images,
        email: userEmail,
        status: "Listed",
        days_rented: 0,
      });

      alert("Item updated successfully");
      navigate(`/items/${id}`);
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  //keeping it similar to the itemdetailpage.jsx styling
  return (
    <Container maxW="container.md" py={16}>
      <VStack spacing={8} w="full" bg="white" p={8} borderRadius="lg" boxShadow="sm">
        <Heading size="lg" alignSelf="start">
          Edit Item
        </Heading>

        <form onSubmit={handleSubmit}>
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

          <VStack spacing={6} w="full">
            <Input
              placeholder="Item name"
              size="lg"
              borderRadius="md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              _placeholder={{ color: "gray.400" }}
            />
            <Textarea
              placeholder="Item description"
              minH="120px"
              size="lg"
              borderRadius="md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              _placeholder={{ color: "gray.400" }}
            />
          </VStack>

          <VStack spacing={6} w="full">
            <Text fontSize="xl" fontWeight="semibold" alignSelf="start">
              Pricing
            </Text>

            <HStack w="full" spacing={4}>
              <Text color="gray.600">$</Text>
              <Input
                type="number"
                placeholder="Daily rate"
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
                placeholder="Collateral amount"
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
            Save Changes
          </Button>

          {isLoading && <Spinner color="blue" size="lg" />}
        </form>
      </VStack>
    </Container>
  );
}

export default EditItemPage;