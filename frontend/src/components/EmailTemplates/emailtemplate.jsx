import { Email, Item, Span } from "react-html-email";

const RentalEmailTemplate = ({ ownerName, itemName, renterName, renterEmail, startDate, endDate, rentalUrl }) => (
    <Email title="New Rental Request">
        <Item align="center">
            <Span fontSize={20}>
                <p>Hello {ownerName},</p>
                <p>A new rental request has been placed for your item: <strong>{itemName}</strong>.</p>
                <p><strong>Renter:</strong> {renterName} ({renterEmail})</p>
                <p><strong>Rental Period:</strong> {startDate} - {endDate}</p>
                <p>
                    <a href={rentalUrl} style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "10px 20px",
                        textDecoration: "none",
                        borderRadius: "5px"
                    }}>
                        View Rental Request
                    </a>
                </p>
                <br />
                <p>Thanks,</p>
                <p><strong>Decentralized Rental Marketplace Team</strong></p>
            </Span>
        </Item>
    </Email>
);

export default RentalEmailTemplate;
