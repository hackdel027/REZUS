

const mongoose = require('mongoose');
const { link } = require('../routes');

const Document = new mongoose.Schema({
  id_perso: {
    type: String,
  },
  date_creation: {
    type: Date,
    default: Date.now
  },
  description: [{  // 
    type: String,
  }],
  type: {
    type: String,
  },
  lien: {
    type: String
  }
});

module.exports = mongoose.model('document', Document);
