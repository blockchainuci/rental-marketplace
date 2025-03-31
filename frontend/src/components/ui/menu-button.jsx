import {  
    Button, 
    Box
  } from "@chakra-ui/react";

const MenuButton = ({
    icon,
    label,
    onClick,
    colorScheme = "white",
    color = "black",
  }) => (
    <Button
      onClick={onClick}
      bg={colorScheme}
      variant="outline"
      borderRadius="xl"
      size="md"
      color={color}
      _hover={{ bg: `${colorScheme}.50` }}
    >
      <Box as={icon} boxSize={5}/>
      {label}
    </Button>
  );

export default MenuButton;