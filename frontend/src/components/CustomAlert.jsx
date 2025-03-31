import { Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return ReactDOM.createPortal(
    <Box
      position="fixed"
      top="20px"
      right="20px"
      bg="white"
      border="1px solid black"
      borderRadius="md"
      p={4}
      zIndex={9999}
    >
      {message}
    </Box>,
    document.body
  );
};

const useCustomAlert = () => {
  const [toast, setToast] = useState(null);

  const showAlert = (message) => {
    setToast(message);
  };

  const hideToast = () => {
    setToast(null);
  };

  return {
    success: (message) => showAlert(message),
    error: (message) => showAlert(message),
    Toast: toast ? <Toast message={toast} onClose={hideToast} /> : null
  };
};

export default useCustomAlert;
