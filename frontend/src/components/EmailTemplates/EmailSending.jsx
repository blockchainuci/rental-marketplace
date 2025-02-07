import { useState } from "react";
import styles from "./EmailSending.module.css"; // Import styles

const EmailSending = () => {
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("Rental Request Notification");
    const [message, setMessage] = useState("");

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

                <button type="submit" className={styles.submitButton}>Send Email</button>
            </form>
        </div>
    );
};

export default EmailSending;
