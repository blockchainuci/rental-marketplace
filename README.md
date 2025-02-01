## Decentralized Rental Marketplace

Welcome to the Decentralized Rental Marketplace! This repository contains both a backend (Node/Express/PostgreSQL) and a frontend (React/ChakraUI/Firebase) for a sample DApp that allows users to list and rent items in a trust-minimized way.

---

## Folder Structure

- **backend/**  
  - Built with **Node.js** and **Express.js**  
  - Connects to a **PostgreSQL** database using a PostgreSQL driver (e.g. `pg`)  
  - Exposes RESTful endpoints for the rental marketplace functionality

- **frontend/**  
  - Built with **React** and styled using **Chakra UI**  
  - Uses **Firebase Authentication** for user login and **Firebase Storage** for images  
  - Interacts with the backend endpoints for data and integrates with any on-chain or off-chain logic as needed

---

## Prerequisites

1. **Node.js** (version `18.20.4` recommended)  
   - MacOS and Linux users can install via [**nvm**](https://github.com/nvm-sh/nvm) for easier version management.
2. **PostgreSQL** (if running locally)  
   - Make sure you have a running PostgreSQL instance and the correct connection details.

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/blockchainuci/rental-marketplace
   cd rental-marketplace
   ```

2. **Install Dependencies**  
   - **Backend** dependencies:
     ```bash
     cd backend
     npm install
     ```
   - **Frontend** dependencies:
     ```bash
     cd ../frontend
     npm install
     ```
   > Once you’ve installed both, you can return to the project root if desired.

---

## Usage

You will need **two terminals** (or background processes), one for the backend and one for the frontend.

### 1. Start the Backend

```bash
cd backend
npm start
```

By default, it should run on `http://localhost:3001/`.  
(Check `backend` code or environment variables to confirm the port.)

### 2. Start the Frontend
- Open new Terminal on your Code Editor

```bash
cd frontend
npm start
```

This should open a new browser window at `http://localhost:3000/`.

---

## Environment Variables

- Click on `backend` repository to create new file called `.env`
  - Copy and paste backend env to `.env` file ([Dev Secrets](https://docs.google.com/document/d/1l7fF8Oc8KGRFVsgQtMcpFqk863isnMTGqbVmZ96Adak/edit?tab=t.0))

- Click on `frontend` repository to create new file called `.env`
  - Copy and paste frontend env to `.env` file ([Dev Secrets](https://docs.google.com/document/d/1l7fF8Oc8KGRFVsgQtMcpFqk863isnMTGqbVmZ96Adak/edit?tab=t.0))

---

## Contributing

1. Create a new branch (`git checkout -b feature/my-feature`)  
2. Commit and push your changes  
3. Create a Pull Request
