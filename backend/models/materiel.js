

const mongoose = require('mongoose');

const Materiel = new mongoose.Schema({
  designation: {
    type: String,
    required: true,
  },
  qte: {
    type: Number,
  },
  responsable: [{  // a qui appartient le materiel
    type: String,
  }],
  etat: {
    type: String,
  },
  date_entre: {
    type: Date,
    default: Date.now
  },
  date_sortie: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('materiel', Materiel);
