import {
  VStack,
  Text,
  Input,
  Textarea,
  Button,
  Grid,
  Box,
  Image,np,
  Flex,
  Center,
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
import { getBearerToken } from "../contexts/AuthContext";
import { connectWallet } from "../wallet/wallet.js";
import useCustomAlert from "../components/CustomAlert";
import imageCompression from "browser-image-compression";
import heic2any from "heic2any";

function ListItemPage() {
  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rentalFee, setRentalFee] = useState("");
  const [collateral, setCollateral] = useState("");
  const [daysLimit, setDaysLimit] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const customAlert = useCustomAlert();
  
  useEffect(() => {
    async function autoConnectWallet() {
        try {
            const accounts = await connectWallet();
            if (accounts && accounts.length > 0) {
              setPublicKey(accounts[0]); // Set the first account
            }
        } catch (error) {
            console.error("Auto-connect error:", error);
        }
    }
  autoConnectWallet();
  }, []); 

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
      // Validate file type
      const allowedTypes = /(\.jpg|\.jpeg|\.png|\.heic)$/i;
      if (!allowedTypes.test(file.name)) {
        alert(`Unsupported file type: ${file.name}`);
        return null;
      }

      let processedFile = file;

      // Convert HEIC to JPEG
      if (file.type === "image/heic" || file.name.endsWith(".heic")) {
        try {
          const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg" });
          processedFile = new File([convertedBlob], file.name.replace(/.heic$/, ".jpg"), { type: "image/jpeg" });
        } catch (error) {
          console.error("HEIC conversion error:", error);
          alert("Failed to convert HEIC file.");
          return null;
        }
      }

      // Compress the image
      const options = {
        maxSizeMB: 1, // Adjust size (1MB target)
        maxWidthOrHeight: 1024, // Resize max dimension
        useWebWorker: true,
      };

      try {
        const compressedBlob = await imageCompression(processedFile, options);
        processedFile = new File([compressedBlob], processedFile.name, { type: processedFile.type });
      } catch (error) {
        console.error("Compression error:", error);
        alert("Failed to compress image.");
        return null;
      }

      // Upload to Firebase Storage
      const storageRef = ref(storage, `items/${Date.now()}-${processedFile.name}`);
      const snapshot = await uploadBytes(storageRef, processedFile);
      return getDownloadURL(snapshot.ref);
    });

    // Filter out any failed uploads
    const uploadedUrls = (await Promise.all(uploadPromises)).filter((url) => url);
    setImages((prevImages) => [...prevImages, ...uploadedUrls]);
  } catch (error) {
    console.error("Error uploading images:", error);
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
        !publicKey
      ) {
        customAlert.error("Please connect a wallet");
        setIsLoading(false);
        return;
      }
      if (
        !name ||
        !description ||
        !rentalFee ||
        !collateral ||
        !daysLimit ||
        !userEmail
      ) {
        customAlert.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }
      const token = await getBearerToken();
      // Create item in database with email

      const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOSTNAME}/items`, {
        name,
        description,
        rental_fee: parseFloat(rentalFee),
        collateral: parseFloat(collateral),
        days_limit: parseInt(daysLimit),
        images,
        email: userEmail,
        status: "Listed",
        public_key: publicKey
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });


      navigate(`/items/${response.data.id}`);
    } catch (error) {
      console.error("Error submitting item:", error);
      customAlert.error("Failed to list item. Please try again.");
    } finally {
      //setIsLoading(false);
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
    <>
    
    {isLoading && (
        <>
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="white"
          opacity="0.5"
          zIndex={1000}
        />
        <Center
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex={1001}
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Center>
      </>
      )}
      
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
            <Center w="full" py={2}>
              {uploading && <Spinner size="sm" mt={2} mb={4} />}
            </Center>
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
            isDisabled={isLoading}
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "md",
            }}
          >
            List Item
          </Button>

        </form>
      </VStack>
    </Container>
    </>
  );
}

export default ListItemPage;
