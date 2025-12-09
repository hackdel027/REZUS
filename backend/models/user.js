const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // un seul utilisateur par email
    lowercase: true
  },
  tel: {
    type: String  // numero de telephone
  },
  age: {
    type: String  
  },
  lieu: {
    type: String  
  },
  pseudo: {
    type: String,
    required: true
  },
  pole: {
    type: String  
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'gestionnaire', 'chefpermanence', 'agent'], // personnalisable selon tes besoins
    default: 'agent'
  },
  date_inscription: {
    type: Date,
    default: Date.now
  },
  lastLogin: { 
    type: Date, 
    default: null 
  }
});

//  Hashage du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer le mot de passe lors du login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
