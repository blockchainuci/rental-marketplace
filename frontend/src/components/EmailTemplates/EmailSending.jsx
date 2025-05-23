import { useState } from "react";
import styles from "./EmailSending.module.css";
import {
    Html,
    Body,
    Container,
    Text,
    Link,
    Heading,
} from "@react-email/components";
import { render } from "@react-email/render";

const EmailSending = () => {
    const [ownerName, setOwnerName] = useState("");
    const [itemName, setItemName] = useState("");
    const [renterName, setRenterName] = useState("");
    const [renterEmail, setRenterEmail] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const createEmailTemplate = () => {
        // Possibly replace with react components in the future
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">New Rental Request</h2>
                <p>Hello ${ownerName},</p>
                <p>A new rental request has been placed for your item: <strong>${itemName}</strong>.</p>
                <p><strong>Renter:</strong> ${renterName} (${renterEmail})</p>
                <p><strong>Rental Period:</strong> ${startDate} - ${endDate}</p>
                <a href="http://localhost:3000/items/${itemName}" 
                   style="background-color: #007bff; color: white; padding: 10px 20px; 
                          text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                    View Rental Request
                </a>
                <p>Thanks,<br/><strong>Decentralized Rental Marketplace Team</strong></p>
            </div>
        `;

        return emailContent;
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();

        const emailData = {
            to: renterEmail,
            subject: "Rental Request Notification",
            html: createEmailTemplate(),
            text: `New Rental Request for ${itemName} from ${renterName}` // Fallback plain text
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_HOSTNAME}/email/send-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(emailData),
            });

            if (!response.ok) {
                throw new Error("Failed to send email");
            }

            alert("Email sent successfully!");
            // Reset form
            setOwnerName("");
            setItemName("");
            setRenterName("");
            setRenterEmail("");
            setStartDate("");
            setEndDate("");
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Error sending email. Please try again.");
        }
    };

    return (
        <div className={styles.container}>
            <h2>Send Rental Request Email</h2>
            <form onSubmit={handleSendEmail} className={styles.form}>
                <label>Owner Name:</label>
                <input
                    type="text"
                    className={styles.emailInput}
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    placeholder="Enter owner name"
                />

                <label>Item Name:</label>
                <input
                    type="text"
                    className={styles.emailInput}
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                    placeholder="Enter item name"
                />

                <label>Renter Name:</label>
                <input
                    type="text"
                    className={styles.emailInput}
                    value={renterName}
                    onChange={(e) => setRenterName(e.target.value)}
                    required
                    placeholder="Enter renter name"
                />

                <label>Renter Email:</label>
                <input
                    type="email"
                    className={styles.emailInput}
                    value={renterEmail}
                    onChange={(e) => setRenterEmail(e.target.value)}
                    required
                    placeholder="Enter renter email"
                />

                <label>Start Date:</label>
                <input
                    type="date"
                    className={styles.emailInput}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />

                <label>End Date:</label>
                <input
                    type="date"
                    className={styles.emailInput}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                />

                <button type="submit" className={styles.submitButton}>Send Request</button>
            </form>
        </div>
    );
};

export default EmailSending;
