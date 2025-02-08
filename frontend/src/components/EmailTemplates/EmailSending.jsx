import { useState } from "react";
import styles from "./EmailSending.module.css"; // Import styles
import EmailTemplate from "./emailtemplate"; // Import email template

const EmailSending = () => {
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("Rental Request Notification");
    const [message, setMessage] = useState("");
    const [showPreview, setShowPreview] = useState(false); // Controls email preview visibility

    const handleSendEmail = async (e) => {
        e.preventDefault();

        const emailData = {
            to,
            subject,
            text: message,
        };

        try {
            const response = await fetch("http://localhost:3001/email/send-email", {
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
            setTo("");
            setMessage("");
            setShowPreview(false); // Hide preview after sending
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Error sending email. Please try again.");
        }
    };

    return (
        <div className={styles.container}>
            <h2>Send Email</h2>
            <form onSubmit={handleSendEmail} className={styles.form}>
                <label>Email Recipient:</label>
                <input
                    type="email"
                    className={styles.emailInput}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                    placeholder="Enter recipient email"
                />

                <label>Message:</label>
                <textarea
                    className={styles.textArea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Enter email message..."
                />

                {/* Button to Show Preview */}
                <button 
                    type="button" 
                    onClick={() => setShowPreview(true)} 
                    className={styles.previewButton}
                >
                    Preview Email
                </button>

                {/* Submit Button */}
                <button type="submit" className={styles.submitButton}>Send Email</button>
            </form>

            {/* Email Template Preview (Only Shows if showPreview is true) */}
            {showPreview && (
                <div className={styles.previewContainer}>
                    <h2>Email Preview</h2>
                    <EmailTemplate
                        userName="John Doe"
                        itemName="Laptop Rental"
                        rentalPrice="$20 per day"
                        confirmationLink="https://rental-marketplace.com/confirm"
                    />
                </div>
            )}
        </div>
    );
};

export default EmailSending;
