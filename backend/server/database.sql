CREATE TYPE item_status AS ENUM ('Listed', 'Awaiting Pickup', 'Renting', 'Returned');

CREATE TABLE Items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description VARCHAR(256) NOT NULL,
    rental_fee INTEGER NOT NULL,
    collateral INTEGER NOT NULL,
    days_limit INTEGER NOT NULL,
    days_rented INTEGER NOT NULL,
    images TEXT[] NOT NULL,
    status item_status NOT NULL
);

CREATE TABLE Carbon (
    id SERIAL PRIMARY KEY, -- Unique identifier for the carbon table
    item_id INT NOT NULL, -- Reference to the items table
    category VARCHAR(255) NOT NULL, -- Category of the item (e.g., electronics, clothing)
    material_composition TEXT NOT NULL, -- List of materials in the item
    estimated_weight_kg FLOAT NOT NULL, -- Estimated weight in kilograms
    country_of_origin VARCHAR(255) NOT NULL, -- Country of origin
    transportation_distance_km FLOAT NOT NULL, -- Estimated transportation distance in kilometers
    transport_mode VARCHAR(50) NOT NULL, -- Mode of transport (e.g., sea, air, road)
    usage_energy_kWh_per_year FLOAT NOT NULL, -- Annual energy consumption in kWh
    lifetime_years FLOAT NOT NULL, -- Estimated lifetime of the item in years
    disposal_method VARCHAR(50) NOT NULL, -- Likely disposal method (e.g., recycling, landfill)

    -- Foreign key constraint linking to the items table
    CONSTRAINT fk_item_id FOREIGN KEY (item_id)
    REFERENCES items (id)
    ON DELETE CASCADE
);

CREATE TABLE Lender (
    item_id INTEGER NOT NULL,
    is_picked_up BOOLEAN NOT NULL,
    is_returned BOOLEAN NOT NULL,
    email VARCHAR(128) NOT NULL,
    PRIMARY KEY (item_id),
    FOREIGN KEY (item_id) REFERENCES Items(id)
);

CREATE TABLE Renter (
    item_id INTEGER NOT NULL,
    is_picked_up BOOLEAN NOT NULL,
    is_returned BOOLEAN NOT NULL,
    email VARCHAR(128) NOT NULL,
    PRIMARY KEY (item_id),
    FOREIGN KEY (item_id) REFERENCES Items(id)
);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(128) NOT NULL,
    wallet_address VARCHAR(256) NOT NULL
);
