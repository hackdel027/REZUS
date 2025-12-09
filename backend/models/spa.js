// models/FichePresence.js

const mongoose = require('mongoose');

const spa_model = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  nbre_total: {
    type: Number,
    required: true
  },
  nbre_present: {
    type: Number,
    required: true
  },
  nbre_absent: {
    type: Number,
    required: true
  },
  absents:[{
    nom: { type: String },
    motif: { type: String, default: "-" }
  }],
  retardataires: [{
    nom: { type: String },
    heure_arrivee: { type: String, default: "-" } // ID des personnes en retard
  }],
  permissionnaires: [{
    nom: { type: String },
    motif: { type: String, default: "-" }
  }],
  presents: [{
    type: String  // ID des personnes présentes
  }]
});

module.exports = mongoose.model('spa_model', spa_model);
