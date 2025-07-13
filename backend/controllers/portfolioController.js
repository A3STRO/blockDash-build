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

    // Fetch real-time prices from Blockchair API
    const fetchPrice = async (blockchain) => {
      try {
        const config = {};
        if (process.env.BLOCKCHAIR_API_KEY && process.env.BLOCKCHAIR_API_KEY !== 'your_blockchair_api_key_here') {
          config.params = { key: process.env.BLOCKCHAIR_API_KEY };
        }

        const priceUrl = `https://api.blockchair.com/${blockchain}/stats`;
        const priceResponse = await axios.get(priceUrl, config);

        if (priceResponse.data && priceResponse.data.data) {
          const price = priceResponse.data.data.market_price_usd || 0;
          console.log(`Fetched price for ${blockchain}: $${price}`);
          return price;
        }

        console.warn(`No price data found for ${blockchain}`);
        return 0;
      } catch (error) {
        console.error(`Error fetching price for ${blockchain}:`, error.message);
        // Return fallback prices if API fails
        const fallbackPrices = {
          'bitcoin': 110000,
          'ethereum': 3000,
          'dogecoin': 0.18,
          'litecoin': 100,
          'bitcoin-cash': 400
        };
        return fallbackPrices[blockchain] || 0;
      }
    };

    // Cache prices to avoid multiple API calls for the same blockchain
    const priceCache = {};

    // Loop through each address and fetch blockchain data from Blockchair API
    for (const addrObj of user.addresses) {
      try {
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

          // Get real-time price for this blockchain
          if (!priceCache[addrObj.blockchain]) {
            priceCache[addrObj.blockchain] = await fetchPrice(addrObj.blockchain);
          }
          const currentPrice = priceCache[addrObj.blockchain];

          switch (addrObj.blockchain) {
            case 'bitcoin':
              balanceInMainUnit = balance / 100000000; // satoshis to BTC
              estimatedValueUSD = balanceInMainUnit * currentPrice;
              break;
            case 'ethereum':
              balanceInMainUnit = balance / 1000000000000000000; // wei to ETH
              estimatedValueUSD = balanceInMainUnit * currentPrice;
              break;
            case 'dogecoin':
              balanceInMainUnit = balance / 100000000; // satoshis to DOGE
              estimatedValueUSD = balanceInMainUnit * currentPrice;
              break;
            case 'litecoin':
              balanceInMainUnit = balance / 100000000; // satoshis to LTC
              estimatedValueUSD = balanceInMainUnit * currentPrice;
              break;
            case 'bitcoin-cash':
              balanceInMainUnit = balance / 100000000; // satoshis to BCH
              estimatedValueUSD = balanceInMainUnit * currentPrice;
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
            currentPrice: currentPrice,
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

const getTransactions = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const addressObj = user.addresses.id(addressId);
    if (!addressObj) {
      return res.status(404).json({ message: 'Address not found.' });
    }

    try {
      let url;
      if (addressObj.blockchain === 'ethereum') {
        url = `https://api.blockchair.com/ethereum/dashboards/address/${addressObj.address}?transaction_details=true&limit=10`;
      } else {
        url = `https://api.blockchair.com/${addressObj.blockchain}/dashboards/address/${addressObj.address}?limit=10,0`;
      }

      const config = {};
      if (process.env.BLOCKCHAIR_API_KEY && process.env.BLOCKCHAIR_API_KEY !== 'your_blockchair_api_key_here') {
        config.params = { key: process.env.BLOCKCHAIR_API_KEY };
      }

      const response = await axios.get(url, config);

      console.log(`API Response for ${addressObj.address}:`, JSON.stringify(response.data, null, 2));
      console.log(`Used URL: ${url}`);

      if (response.data && response.data.data && response.data.data[addressObj.address]) {
        const addressData = response.data.data[addressObj.address];
        let transactions = [];

        if (addressObj.blockchain === 'ethereum') {
          transactions = addressData.transactions || [];

          // If no transactions array, check for other possible structures
          if (transactions.length === 0 && addressData.calls) {
            // Ethereum might have 'calls' instead of 'transactions'
            transactions = addressData.calls || [];
          }
        } else {
          transactions = addressData.transactions || [];
        }

        console.log(`Found ${transactions.length} transactions for address ${addressObj.address}`);
        console.log(`Transactions:`, transactions);
        console.log(`Address Data Keys:`, Object.keys(addressData));

        // If no transactions in address data, try the raw transactions endpoint
        if (transactions.length === 0) {
          console.log(`No transactions found in dashboard data, trying raw transactions endpoint`);

          try {
            let txUrl;
            if (addressObj.blockchain === 'ethereum') {
              txUrl = `https://api.blockchair.com/ethereum/dashboards/address/${addressObj.address}`;
            } else {
              txUrl = `https://api.blockchair.com/${addressObj.blockchain}/addresses/${addressObj.address}/transactions?limit=10`;
            }

            const txResponse = await axios.get(txUrl, config);

            console.log(`Raw transactions API response:`, JSON.stringify(txResponse.data, null, 2));

            if (txResponse.data && txResponse.data.data) {
              let rawTransactions = [];

              if (addressObj.blockchain === 'ethereum') {
                const ethData = txResponse.data.data[addressObj.address];
                if (ethData && ethData.transactions) {
                  rawTransactions = ethData.transactions;
                }
              } else {
                rawTransactions = txResponse.data.data;
              }

              if (rawTransactions.length > 0) {
                const formattedTransactions = rawTransactions.map(txHash => {
                  return {
                    txId: txHash,
                    type: 'unknown', // We'll need to fetch details to determine this
                    amount: 0,
                    date: new Date().toISOString(),
                    blockHeight: 0
                  };
                });

                return res.status(200).json({
                  address: addressObj.address,
                  blockchain: addressObj.blockchain,
                  transactions: formattedTransactions,
                  totalTransactions: rawTransactions.length
                });
              }
            }
          } catch (rawTxError) {
            console.error(`Raw transactions API error:`, rawTxError.message);
          }
        }

        // Process transactions from dashboard data
        const formattedTransactions = [];

        console.log(`Processing ${transactions.length} transactions from dashboard data`);

        for (const txHash of transactions.slice(0, 10)) {
          try {
            // Get detailed transaction data
            const txDetailUrl = `https://api.blockchair.com/${addressObj.blockchain}/dashboards/transaction/${txHash}`;
            console.log(`Fetching transaction details from: ${txDetailUrl}`);

            const txDetailResponse = await axios.get(txDetailUrl, config);

            console.log(`Transaction detail response for ${txHash}:`, JSON.stringify(txDetailResponse.data, null, 2));

            if (txDetailResponse.data && txDetailResponse.data.data && txDetailResponse.data.data[txHash]) {
              const txData = txDetailResponse.data.data[txHash];
              const transaction = txData.transaction;
              const inputs = txData.inputs || [];
              const outputs = txData.outputs || [];

              console.log(`Processing transaction ${txHash} for ${addressObj.blockchain} address ${addressObj.address}`);
              console.log(`Transaction data:`, transaction);
              console.log(`Inputs:`, inputs);
              console.log(`Outputs:`, outputs);

              let amount = 0;
              let type = 'unknown';

              // Determine transaction type and amount based on blockchain
              switch (addressObj.blockchain) {
                case 'bitcoin':
                case 'bitcoin-cash':
                case 'litecoin':
                case 'dogecoin':
                  let inputAmount = 0;
                  let outputAmount = 0;
                  let isFromThisAddress = false;
                  let isToThisAddress = false;

                  // Check inputs (spending from this address)
                  inputs.forEach(input => {
                    if (input.spending_address === addressObj.address) {
                      inputAmount += parseInt(input.value || 0);
                      isFromThisAddress = true;
                    }
                  });

                  // Check outputs (receiving to this address)
                  outputs.forEach(output => {
                    if (output.recipient === addressObj.address) {
                      outputAmount += parseInt(output.value || 0);
                      isToThisAddress = true;
                    }
                  });

                  console.log(`Address analysis for ${addressObj.address}:`);
                  console.log(`Input amount: ${inputAmount}, Output amount: ${outputAmount}`);
                  console.log(`Is from this address: ${isFromThisAddress}, Is to this address: ${isToThisAddress}`);

                  if (isFromThisAddress && !isToThisAddress) {
                    type = 'send';
                    amount = inputAmount / 100000000; // satoshis to main unit
                  } else if (!isFromThisAddress && isToThisAddress) {
                    type = 'receive';
                    amount = outputAmount / 100000000; // satoshis to main unit
                  } else if (isFromThisAddress && isToThisAddress) {
                    // Self-transaction or change
                    const netAmount = outputAmount - inputAmount;
                    if (netAmount > 0) {
                      type = 'receive';
                      amount = netAmount / 100000000;
                    } else {
                      type = 'send';
                      amount = Math.abs(netAmount) / 100000000;
                    }
                  } else {
                    // If we can't determine, check if any input is from this address
                    let totalInputFromAddress = 0;
                    let totalOutputToAddress = 0;

                    inputs.forEach(input => {
                      if (input.spending_address === addressObj.address) {
                        totalInputFromAddress += parseInt(input.value || 0);
                      }
                    });

                    outputs.forEach(output => {
                      if (output.recipient === addressObj.address) {
                        totalOutputToAddress += parseInt(output.value || 0);
                      }
                    });

                    if (totalInputFromAddress > 0) {
                      type = 'send';
                      amount = totalInputFromAddress / 100000000;
                    } else if (totalOutputToAddress > 0) {
                      type = 'receive';
                      amount = totalOutputToAddress / 100000000;
                    }
                  }

                  console.log(`Final transaction type: ${type}, amount: ${amount}`);
                  break;

                case 'ethereum':
                  console.log(`Ethereum transaction - sender: ${transaction.sender}, recipient: ${transaction.recipient}, value: ${transaction.value}`);
                  console.log(`Current address: ${addressObj.address}`);

                  // Normalize addresses to lowercase for comparison
                  const normalizedAddress = addressObj.address.toLowerCase();
                  const normalizedSender = transaction.sender ? transaction.sender.toLowerCase() : '';
                  const normalizedRecipient = transaction.recipient ? transaction.recipient.toLowerCase() : '';

                  if (normalizedSender === normalizedAddress) {
                    type = 'send';
                    amount = parseInt(transaction.value || 0) / 1000000000000000000; // wei to ETH
                  } else if (normalizedRecipient === normalizedAddress) {
                    type = 'receive';
                    amount = parseInt(transaction.value || 0) / 1000000000000000000; // wei to ETH
                  }

                  console.log(`Ethereum transaction type: ${type}, amount: ${amount}`);
                  break;
              }

              formattedTransactions.push({
                txId: txHash,
                type: type,
                amount: amount,
                date: transaction.time ? new Date(transaction.time).toISOString() : new Date().toISOString(),
                blockHeight: transaction.block_id || 0
              });
            } else {
              console.log(`No transaction data found for ${txHash}`);
              // Add a placeholder transaction if we can't get details
              formattedTransactions.push({
                txId: txHash,
                type: 'unknown',
                amount: 0,
                date: new Date().toISOString(),
                blockHeight: 0
              });
            }
          } catch (txError) {
            console.error(`Error fetching transaction details for ${txHash}:`, txError.message);
            // Add a placeholder transaction if we can't get details
            formattedTransactions.push({
              txId: txHash,
              type: 'unknown',
              amount: 0,
              date: new Date().toISOString(),
              blockHeight: 0
            });
          }
        }

        res.status(200).json({
          address: addressObj.address,
          blockchain: addressObj.blockchain,
          transactions: formattedTransactions,
          totalTransactions: transactions.length
        });
      } else {
        console.log(`No address data found in API response for ${addressObj.address}`);
        console.log(`Full API response:`, JSON.stringify(response.data, null, 2));

        if (addressObj.blockchain === 'ethereum') {
          console.log('Ethereum address detected - checking if address is valid...');

          // Validate Ethereum address format
          const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
          if (!ethAddressRegex.test(addressObj.address)) {
            return res.status(400).json({
              message: 'Invalid Ethereum address format',
              error: 'Address must be a valid Ethereum address starting with 0x'
            });
          }
        }

        res.status(200).json({
          address: addressObj.address,
          blockchain: addressObj.blockchain,
          transactions: [],
          totalTransactions: 0,
          message: 'No transaction data available - this address may not have any transactions or may be inactive'
        });
      }
    } catch (apiError) {
      console.error(`Transaction API error for ${addressObj.blockchain} address ${addressObj.address}:`, apiError.message);

      // Handle specific error cases
      if (apiError.response) {
        const statusCode = apiError.response.status;
        console.error(`API returned status code: ${statusCode}`);

        switch (statusCode) {
          case 430:
            return res.status(429).json({
              message: 'Rate limit exceeded. Please try again later or add a valid API key.',
              error: 'Too many requests to Blockchair API'
            });
          case 404:
            return res.status(404).json({
              message: 'Address not found or has no transaction history',
              error: 'Address may be invalid or inactive'
            });
          case 403:
            return res.status(403).json({
              message: 'API access denied. Please check your API key configuration.',
              error: 'Authentication failed'
            });
          default:
            return res.status(500).json({
              message: 'Unable to fetch transaction data',
              error: `API error: ${apiError.message}`
            });
        }
      }

      res.status(500).json({
        message: 'Unable to fetch transaction data',
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error while fetching transactions' });
  }
};

module.exports = { addAddress, deleteAddress, getPortfolio, getTransactions };
