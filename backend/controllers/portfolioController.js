const User = require('../models/User');
const axios = require('axios');

const addAddress = async (req, res) => {
  try {
    const { blockchain, address } = req.body;

    if (!blockchain || !address) {
      return res.status(400).json({ message: 'Blockchain and address are required.' });
    }

    const validBlockchains = ['bitcoin', 'ethereum', 'dogecoin', 'litecoin', 'bitcoin-cash'];
    if (!validBlockchains.includes(blockchain.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid blockchain type.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const existingAddress = user.addresses.find(addr =>
      addr.blockchain === blockchain.toLowerCase() && addr.address === address
    );

    if (existingAddress) {
      return res.status(400).json({ message: 'Address already exists in your portfolio.' });
    }

    user.addresses.push({ blockchain: blockchain.toLowerCase(), address });
    await user.save();

    res.status(201).json({
      message: 'Address added successfully.',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Server error while adding address' });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const addressToRemove = user.addresses.id(id);
    if (!addressToRemove) {
      return res.status(404).json({ message: 'Address not found.' });
    }

    addressToRemove.deleteOne();
    await user.save();

    res.status(200).json({
      message: 'Address removed successfully.',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error while removing address' });
  }
};

const getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const results = [];
    let totalPortfolioValueUSD = 0;

    // Loop through each address and fetch blockchain data from Blockchair API
    for (const addrObj of user.addresses) {
      try {
        // Build API URL based on blockchain and address
        const url = `https://api.blockchair.com/${addrObj.blockchain}/dashboards/address/${addrObj.address}`;

        const config = {};
        if (process.env.BLOCKCHAIR_API_KEY && process.env.BLOCKCHAIR_API_KEY !== 'your_blockchair_api_key_here') {
          config.params = { key: process.env.BLOCKCHAIR_API_KEY };
        }

        const response = await axios.get(url, config);

        if (response.data && response.data.data && response.data.data[addrObj.address]) {
          const balanceData = response.data.data[addrObj.address];
          const balance = balanceData.address.balance || 0;

          let balanceInMainUnit = 0;
          let estimatedValueUSD = 0;

          switch (addrObj.blockchain) {
            case 'bitcoin':
              balanceInMainUnit = balance / 100000000; // satoshis to BTC
              estimatedValueUSD = balanceInMainUnit * 110000; // Rough BTC price
              break;
            case 'ethereum':
              balanceInMainUnit = balance / 1000000000000000000; // wei to ETH
              estimatedValueUSD = balanceInMainUnit * 3000; // Rough ETH price
              break;
            case 'dogecoin':
              balanceInMainUnit = balance / 100000000; // satoshis to DOGE
              estimatedValueUSD = balanceInMainUnit * 0.18; // Rough DOGE price
              break;
            case 'litecoin':
              balanceInMainUnit = balance / 100000000; // satoshis to LTC
              estimatedValueUSD = balanceInMainUnit * 100; // Rough LTC price
              break;
            case 'bitcoin-cash':
              balanceInMainUnit = balance / 100000000; // satoshis to BCH
              estimatedValueUSD = balanceInMainUnit * 400; // Rough BCH price
              break;
            default:
              balanceInMainUnit = balance;
              estimatedValueUSD = 0;
          }

          totalPortfolioValueUSD += estimatedValueUSD;

          results.push({
            id: addrObj._id,
            blockchain: addrObj.blockchain,
            address: addrObj.address,
            balance: balanceInMainUnit,
            balanceRaw: balance,
            estimatedValueUSD: estimatedValueUSD.toFixed(2),
            lastUpdated: new Date().toISOString()
          });
        } else {
          results.push({
            id: addrObj._id,
            blockchain: addrObj.blockchain,
            address: addrObj.address,
            error: 'No data available for this address'
          });
        }
      } catch (apiError) {
        console.error(`API error for ${addrObj.blockchain} address ${addrObj.address}:`, apiError.message);
        results.push({
          id: addrObj._id,
          blockchain: addrObj.blockchain,
          address: addrObj.address,
          error: 'Unable to fetch data for this address'
        });
      }
    }

    res.status(200).json({
      portfolio: results,
      totalPortfolioValueUSD: totalPortfolioValueUSD.toFixed(2),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ message: 'Server error while fetching portfolio' });
  }
};

module.exports = { addAddress, deleteAddress, getPortfolio };
