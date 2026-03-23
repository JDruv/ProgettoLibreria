const mongoose = require('mongoose');

const PrestitoSchema = new mongoose.Schema({
  // Riferimento all'ID di un documento nella collection 'Utenti'
  utente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Utente', // Il nome del modello
    required: true 
  },
  // Riferimento all'ID di un documento nella collection 'Libri'
  libro: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Libro', // Il nome del modello
    required: true 
  },
  dataPrestito: { type: Date, default: Date.now },
  dataRestituzionePrevista: { type: Date, required: true },
  restituito: { type: Boolean, default: false } // 'false' = in prestito, 'true' = restituito
},
{
  collection: 'Prestiti' // Nome esplicito della collezione
});

module.exports = mongoose.model('Prestito', PrestitoSchema);