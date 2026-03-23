const mongoose = require('mongoose');

const LibroSchema = new mongoose.Schema({
  titolo: { type: String, required: true },
  autore: { type: String, required: true },
  anno: { type: Number },
  genere: { type: String },
  isbn: { type: String, unique: true, sparse: true }, // 'sparse' permette null/duplicati se non fornito
  disponibile: { type: Boolean, default: true } // Utilissimo: ci dice se è fuori in prestito
},
{
  collection: 'Libri' // Nome esplicito della collezione
});

module.exports = mongoose.model('Libro', LibroSchema);