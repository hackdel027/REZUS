const mongoose = require('mongoose');

const permanenceSchema = new mongoose.Schema({
  id_semaine: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now
  },
  materiel: [{
    type: String,
    required: true
  }],
  evenement: {
    type: String,
  },
  nom: {
    type: String,
  },
  heureDebut: {
    type: String, // Stockage en format "HH:MM"
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} n'est pas une heure valide (format HH:MM)`
    }
  },
  heureFin: {
    type: String, // Stockage en format "HH:MM"
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} n'est pas une heure valide (format HH:MM)`
    }
  },
  montant: {
    type: String,
    default: ""
  },
});

const planPermanenceSchema = new mongoose.Schema({
  semaine: {
    coordinateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    jours: [{
      nom: { 
        type: String,
        required: true
      },
      date: { 
        type: Date,
        required: true
      },
      agents: {
        type: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }],
        validate: {
          validator: function(v) {
            return Array.isArray(v) && v.length === 3;
          },
          message: 'Il doit y avoir exactement 3 agents par jour'
        }
      }
    }]
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Planpermanence = mongoose.model('planpermanence', planPermanenceSchema);
const Permanence = mongoose.model('permanence', permanenceSchema);

module.exports = {
  Permanence,
  Planpermanence
};