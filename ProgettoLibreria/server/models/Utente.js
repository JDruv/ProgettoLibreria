const mongoose = require('mongoose');

const UtenteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cognome: { type: String }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dataRegistrazione: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
  
  // --- NUOVI CAMPI ---
  genere: { type: String, enum: ['Maschio', 'Femmina', 'Altro'], default: 'Altro' },
  eta: { type: Number }
}, 
{ 
  collection: 'Utenti'
});

module.exports = mongoose.model('Utente', UtenteSchema);