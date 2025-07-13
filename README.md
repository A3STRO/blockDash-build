# Crypto Portfolio Tracker

## Overview
Crypto Portfolio Tracker is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application that allows users to track their cryptocurrency portfolios. Users can register, log in, add wallet addresses from various blockchains (Bitcoin, Ethereum, Dogecoin, Litecoin, Bitcoin Cash), view their portfolio dashboard with total value, address details, transaction history, and a live market overview widget powered by TradingView.

The application features a modern, responsive UI with Tailwind CSS styling, glassmorphism effects, and smooth animations. The backend handles user authentication with JWT and integrates with external APIs for fetching blockchain data.

## Features
- **User Authentication**: Secure registration and login system with JWT-based authentication.
- **Portfolio Management**: Add, view, and delete cryptocurrency wallet addresses.
- **Dashboard**: Displays total portfolio value in USD, list of added addresses with balances, and transaction history modal.
- **Market Overview**: Integrated TradingView widget showing live charts for major cryptocurrencies (BTC, ETH, DOGE, LTC, BCH).
- **Transaction Viewer**: Modal to view detailed transaction history for each address.
- **Responsive Design**: Fully responsive UI with clean, modern styling using Tailwind CSS and custom animations.
- **Error Handling**: User-friendly error messages and loading states.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (assumed, based on MERN stack; configure as needed)
- **Authentication**: JWT (JSON Web Tokens)
- **APIs**: Custom backend API for portfolio management, integrated with external blockchain data providers (e.g., via portfolioAPI)
- **Other**: Puppeteer for browser actions (if needed for testing), various npm packages for utilities.

## Project Structure
```
Crypto-Portfolio-Tracker/
├── backend/
│   ├── controllers/         # API controllers for auth and portfolio
│   ├── middleware/          # Authentication middleware
│   ├── models/              # MongoDB models (e.g., User)
│   ├── routes/              # API routes
│   ├── package.json
│   └── server.js            # Main server file
├── frontend/
│   ├── public/              # Public assets
│   ├── src/
│   │   ├── components/      # React components (Auth, Portfolio)
│   │   ├── context/         # React context (e.g., AuthContext)
│   │   ├── services/        # API service helpers
│   │   ├── App.js           # Main app component
│   │   ├── index.css        # Global styles and animations
│   │   └── index.js         # Entry point
│   ├── package.json
│   ├── postcss.config.js    # PostCSS config
│   └── tailwind.config.js   # Tailwind CSS config
├── .gitignore
└── README.md                # This file
```

## Prerequisites
- Node.js (v14+ recommended)
- npm or yarn
- MongoDB instance (local or cloud, e.g., MongoDB Atlas)
- API keys for any external blockchain data services (if integrated)

## Installation and Setup

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   # Add any other required API keys
   ```
4. Start the backend server:
   ```
   npm run dev  # or node server.js
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend development server:
   ```
   npm start
   ```
   The app will run on `http://localhost:3000`.

### Running the Full Application
- Ensure the backend is running on `http://localhost:5000`.
- The frontend will proxy API requests to the backend.

## Usage
1. Register a new account or log in.
2. On the dashboard, add wallet addresses by selecting a blockchain and entering the address.
3. View your portfolio summary, including total value and individual address details.
4. Click "View Transactions" on any address card to see transaction history.
5. Use the refresh button to update portfolio data.
6. View live market charts in the Market Overview section.

## Development Notes
- **Styling**: Custom Tailwind CSS utilities and animations are defined in `src/index.css`.
- **API Integration**: API calls are handled in `src/services/api.js` using Axios.
- **Authentication**: Managed via React Context in `src/context/AuthContext.js`.
- **Testing**: The app includes loading states, error handling, and responsive design. For thorough testing, use browser tools or Puppeteer.

## Contributing
Feel free to fork the repository and submit pull requests for improvements or bug fixes.

## License
This project is licensed under the MIT License.
