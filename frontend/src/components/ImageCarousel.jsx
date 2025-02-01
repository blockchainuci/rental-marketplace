import { useState } from "react";
import { Box, Flex, Image } from "@chakra-ui/react";
import { useSwipeable } from "react-swipeable";

function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <Flex position="relative" w="full" maxW="600px">
      <Box overflow="hidden" w="full">
        <Box position="relative" {...handlers}>
          <Flex
            transition="transform 0.3s ease-in-out"
            transform={`translateX(-${currentIndex * 100}%)`}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`Product image ${index + 1}`}
                minW="100%"
                h="400px"
                objectFit="cover"
                draggable="false"
              />
            ))}
          </Flex>

          <Flex
            position="absolute"
            bottom={4}
            left="50%"
            transform="translateX(-50%)"
            gap={2}
            bg="blackAlpha.300"
            px={3}
            py={2}
            borderRadius="full"
          >
            {images.map((_, index) => (
              <Box
                key={index}
                as="button"
                w={2}
                h={2}
                borderRadius="full"
                bg={currentIndex === index ? "white" : "whiteAlpha.600"}
                onClick={() => setCurrentIndex(index)}
                transition="all 0.2s"
                _hover={{
                  bg: currentIndex === index ? "white" : "whiteAlpha.800",
                }}
              />
            ))}
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}

export default ImageCarousel;
