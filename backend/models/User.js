const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  blockchain: {
    type: String,
    required: true,
    enum: ['bitcoin', 'ethereum', 'dogecoin', 'litecoin', 'bitcoin-cash']
  },
  address: { type: String, required: true }
}, { timestamps: true });

// timestamps will automatically add createdAt and updatedAt fields
// trim will remove whitespace from both ends of the string

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  addresses: [AddressSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);