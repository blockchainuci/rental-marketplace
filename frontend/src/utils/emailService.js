import axios from "axios";

// Function to send rental request email
export const sendRentalEmail = async (renterEmail, item, days) => {
  const startDate = new Date().toISOString().split("T")[0];
  const endDate = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
  const rentalFee = item.rental_fee * days;
  const total = rentalFee + item.collateral;

  // Common email template for both lender and renter
  const createEmailContent = (isLender) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${isLender ? 'New Rental Request' : 'Rental Request Sent'}</h2>
      <p>Hello ${isLender ? 'Lender' : renterEmail.split('@')[0]},</p>
      <p>${isLender ? 'A new rental request has been placed for' : 'You have requested to rent'} the following item:</p>
      <p><strong>Item:</strong> ${item.name}</p>
      <p><strong>${isLender ? 'Renter' : 'Your'} Information:</strong> ${renterEmail}</p>
      <p><strong>Rental Period:</strong> ${startDate} - ${endDate}</p>
      <p><strong>Rental Details:</strong></p>
      <ul>
        <li>Rental Fee: $${item.rental_fee} × ${days} days = $${rentalFee}</li>
        <li>Collateral: $${item.collateral} (Refundable)</li>
        <li>Total: $${total}</li>
      </ul>
      ${item.images[0] ? `
        <p><img src="${item.images[0]}" alt="${item.name}" width="200" style="border-radius: 8px;" /></p>
      ` : ''}
      <a href="http://localhost:3000/items/${item.id}" 
         style="background-color: #007bff; color: white; padding: 10px 20px; 
                text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
        View Item Details
      </a>
      <p>Thanks,<br/><strong>Decentralized Rental Marketplace Team</strong></p>
    </div>
  `;

  try {
    // Verify recipient emails exist before sending
    if (!item.lender_email) {
      console.error("❌ Lender email is missing");
      return;
    }

    if (!renterEmail) {
      console.error("❌ Renter email is missing");
      return;
    }

    // Send email to lender
    await axios.post(`${process.env.REACT_APP_BACKEND_HOSTNAME}/email/send-email`, {
      to: item.lender_email.trim(),
      subject: "New Rental Request",
      html: createEmailContent(true)
    });

    // Send confirmation email to renter
    await axios.post(`${process.env.REACT_APP_BACKEND_HOSTNAME}/email/send-email`, {
      to: renterEmail.trim(),
      subject: "Rental Request Sent",
      html: createEmailContent(false)
    });

    console.log("✅ Emails sent successfully!");
    console.log("📧 Sent to lender:", item.lender_email);
    console.log("📧 Sent to renter:", renterEmail);
  } catch (error) {
    console.error("❌ Error sending emails:", error);
    console.error("Debug info:", {
      lenderEmail: item.lender_email,
      renterEmail: renterEmail,
      itemName: item.name
    });
  }
};
