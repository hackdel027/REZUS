

const mongoose = require('mongoose');

const Recompense = new mongoose.Schema({
  id_perso: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: [{  // 
    type: String,
  }],
  id_responsable: {
    type: String, // celui qui donne la recompense
  }
});

module.exports = mongoose.model('recompense', Recompense);
