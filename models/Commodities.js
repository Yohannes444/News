const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
  date: Date,
  catagory: String,
  marketData: [{
    name: String,
    currency: String,
    percent_change: Number,
    price: Number,
  }]
});

module.exports = mongoose.model('Commoditie', marketDataSchema); // Corrected model name
// Rest of your code remains unchanged...
