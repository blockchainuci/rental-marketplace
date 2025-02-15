import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ItemDetailPage from "./pages/ItemDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import ListItemPage from "./pages/ListItemPage";
import RentPage from "./pages/RentPage";
import LendPage from "./pages/LendPage";
import CheckoutConfirmationPage from "./pages/CheckoutConfirmationPage";
import WaitingPage from "./pages/WaitingPage";
import PickupConfirmationPage from "./pages/PickupConfirmationPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import LedgerPage from "./pages/LedgerPage";
import LearnPage from "./pages/LearnPage";
import Utils from "./components/Utils";
import ChatPage from "./pages/ChatPage"
import EmailSending from './components/EmailTemplates/EmailSending';
import MessagesPage from "./pages/MessagesPage";

const App = () => {
  return (
    <Router>
      <div>
        {/* Navbar remains persistent across all routes */}
        <Navbar />

        <Routes>
          {/* Route for the home page */}
          <Route path="/" element={<HomePage />} />

          {/* Route for the item detail page */}
          <Route path="/items/:id" element={<ItemDetailPage />} />

          {/* Route for the chat page */}
          <Route path="/chat/:id" element={<ChatPage />} />

          {/* Updated: Route for the messages page */}
          <Route path="/messages/:id" element={<MessagesPage />} />
          
          {/* Route for the checkout page */}
          <Route path="/checkout/:id" element={<CheckoutPage />} />

          {/* Route for the list item page */}
          <Route path="/list" element={<ListItemPage />} />

          {/* Route for the rent page */}
          <Route path="/rent" element={<RentPage />} />

          {/* Route for the lend page */}
          <Route path="/lend" element={<LendPage />} />

          {/* Route for the checkout confirmation page */}
          <Route
            path="/checkout_confirmation/:id"
            element={<CheckoutConfirmationPage />}
          />

          {/* Update the waiting page route to include id parameter */}
          <Route path="/waiting/:id" element={<WaitingPage />} />

          {/* Add the new pickup confirmation page route */}
          <Route
            path="/pickup-confirmation/:id"
            element={<PickupConfirmationPage />}
          />

          {/* Route for the signin page */}
          <Route path="/signin" element={<SignInPage />} />

          {/* Route for the signup page */}
          <Route path="/signup" element={<SignUpPage />} />

          {/* Add the new ledger page route */}
          <Route path="/ledger" element={<LedgerPage />} />

          {/* Add the new learn page route */}
          <Route path="/learn" element={<LearnPage />} />

          {/* Simply for backend testing, feel free to modify/delete this component*/}
          <Route path="/email-test" element={<EmailSending />} />

          <Route path="/utils" element={<Utils />} />
        </Routes>

        {/* Footer remains persistent across all routes */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
