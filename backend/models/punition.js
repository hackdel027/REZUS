

const mongoose = require('mongoose');

const Punition = new mongoose.Schema({
  id_perso: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now
  },
  motif: {
    type: String,
    required: true
  },
  sanction: {
    type: String,
    require: true
  },
  responsable: {
    type: String,
    required: true // le coordonateur qui est a l'origine de la punition
  }
});

module.exports = mongoose.model('punition', Punition);
