import axios from "axios";
import RentalEmailTemplate from "../components/EmailTemplates/emailtemplate";
import React from "react";
import ReactDOMServer from "react-dom/server";

// Function to send rental request email
export const sendRentalEmail = async (renterEmail, item, days) => {
  const startDate = new Date().toISOString().split("T")[0]; // Today's date
  const endDate = new Date(Date.now() + days * 86400000).toISOString().split("T")[0]; // End date

  // Convert JSX email template to HTML
  const emailHtml = ReactDOMServer.renderToString(
    <RentalEmailTemplate
      ownerName="Lender" // Placeholder
      itemName={item.name}
      renterName={renterEmail.split("@")[0]} // Extracts first part of email as name
      renterEmail={renterEmail}
      startDate={startDate}
      endDate={endDate}
      rentalUrl={`http://localhost:3000/items/${item.id}`} // Link to item details
      imageUrl={item.images[0]}
    />
  );

  const emailData = {
    to: item.lender_email, // Lender email retrieved from the backend
    subject: "New Rental Request",
    html: emailHtml
  };

  try {
    await axios.post("http://localhost:3001/send-email", emailData);
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};
