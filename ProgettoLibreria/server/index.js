// link sito https://x0qt51t2-5173.euw.devtunnels.ms/
// link server https://x0qt51t2-5000.euw.devtunnels.ms/
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { fakerIT: faker } = require('@faker-js/faker'); // Faker in Italiano

const Utente = require('./models/Utente');
const Libro = require('./models/Libro');
const Prestito = require('./models/Prestito');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connesso a MongoDB Locale!"))
  .catch(err => console.error("❌ Errore Mongo:", err));

// Middleware Auth
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, u) => {
    if (err) return res.sendStatus(403);
    req.utente = u;
    next();
  });
};

// --- ROTTE AUTH ---
app.post('/api/register', async (req, res) => {
    try {
        const { nome, email, password, genere, eta } = req.body;
        if (await Utente.findOne({ email })) return res.status(400).json({ message: "Email già usata." });
        const hash = await bcrypt.hash(password, 10);
        await new Utente({ nome, email, password: hash, genere, eta }).save();
        res.status(201).json({ message: "Registrato!" });
      } catch (e) { res.status(500).json({ message: "Errore server" }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const utente = await Utente.findOne({ email });
        if (!utente || !await bcrypt.compare(password, utente.password)) 
          return res.status(400).json({ message: "Credenziali errate." });
        const token = jwt.sign({ id: utente._id, isAdmin: utente.isAdmin }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, nome: utente.nome, isAdmin: utente.isAdmin });
      } catch (e) { res.status(500).json({ message: "Errore server" }); }
});

// --- ROTTE CRUD (Libri/Utenti/Prestiti) ---

// ROTTE LIBRI
app.get('/api/libri', auth, async (req, res) => {
  try {
    const libri = await Libro.find();
    res.json(libri);
  } catch (e) { res.status(500).json({ message: "Errore server" }); }
});

app.post('/api/libri', auth, async (req, res) => {
  if (!req.utente.isAdmin) return res.sendStatus(403);
  try {
    const nuovoLibro = new Libro(req.body);
    await nuovoLibro.save();
    res.status(201).json(nuovoLibro);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

app.put('/api/libri/:id', auth, async (req, res) => {
  if (!req.utente.isAdmin) return res.sendStatus(403);
  try {
    const libro = await Libro.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!libro) return res.status(404).json({ message: "Libro non trovato" });
    res.json(libro);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

app.delete('/api/libri/:id', auth, async (req, res) => {
  if (!req.utente.isAdmin) return res.sendStatus(403);
  try {
    const libro = await Libro.findByIdAndDelete(req.params.id);
    if (!libro) return res.status(404).json({ message: "Libro non trovato" });
    res.json({ message: "Libro eliminato" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ROTTE UTENTI
app.get('/api/utenti', auth, async (req, res) => {
    if (!req.utente.isAdmin) return res.sendStatus(403);
    try {
        const utenti = await Utente.aggregate([
            {
                $lookup: {
                    from: 'Prestiti',
                    let: { utenteId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$utente', '$$utenteId'] } } },
                        {
                            $lookup: {
                                from: 'Libri',
                                localField: 'libro',
                                foreignField: '_id',
                                as: 'libro'
                            }
                        },
                        {
                            $unwind: {
                                path: '$libro',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    as: 'prestiti'
                }
            },
            {
                $project: {
                    password: 0
                }
            }
        ]);
        res.json(utenti);
    } catch (e) { 
        console.error(e);
        res.status(500).json({ message: "Errore server" }); 
    }
});

app.put('/api/utenti/:id', auth, async (req, res) => {
    if (!req.utente.isAdmin) return res.sendStatus(403);
    try {
        const { nome, email } = req.body;
        const utente = await Utente.findByIdAndUpdate(
            req.params.id,
            { nome, email },
            { new: true }
        ).select('-password');
        if (!utente) return res.status(404).json({ message: "Utente non trovato" });
        res.json(utente);
    } catch (e) { res.status(400).json({ message: e.message }); }
});

app.delete('/api/utenti/:id', auth, async (req, res) => {
    if (!req.utente.isAdmin) return res.sendStatus(403);
    try {
        // Verifica che l'utente non sia admin
        const utente = await Utente.findById(req.params.id);
        if (!utente) return res.status(404).json({ message: "Utente non trovato" });
        if (utente.isAdmin) return res.status(403).json({ message: "Impossibile eliminare un admin" });
        
        // Elimina tutti i prestiti dell'utente
        await Prestito.deleteMany({ utente: req.params.id });
        
        // Elimina l'utente
        await Utente.findByIdAndDelete(req.params.id);
        res.json({ message: "Utente eliminato con successo" });
    } catch (e) { res.status(500).json({ message: e.message }); }
});


// ROTTE PRESTITI
app.get('/api/prestiti', auth, async (req, res) => {
    if (!req.utente.isAdmin) return res.sendStatus(403);
    try {
        const prestiti = await Prestito.find().populate('utente', 'nome email').populate('libro', 'titolo');
        res.json(prestiti);
    } catch (e) { res.status(500).json({ message: "Errore server" }); }
});

app.get('/api/prestiti/mieiprestiti', auth, async (req, res) => {
    try {
        const prestiti = await Prestito.find({ utente: req.utente.id }).populate('libro', 'titolo autore');
        res.json(prestiti);
    } catch (e) { res.status(500).json({ message: "Errore server" }); }
});

app.post('/api/prestiti/prendi', auth, async (req, res) => {
    const { libroId } = req.body;
    try {
        const libro = await Libro.findById(libroId);
        if (!libro) return res.status(404).json({ message: "Libro non trovato." });
        if (!libro.disponibile) return res.status(400).json({ message: "Libro non disponibile." });

        libro.disponibile = false;
        await libro.save();

        const dataRestituzione = new Date();
        dataRestituzione.setDate(dataRestituzione.getDate() + 30); // Prestito di 30 giorni

        const prestito = new Prestito({
            utente: req.utente.id,
            libro: libroId,
            dataRestituzionePrevista: dataRestituzione
        });
        await prestito.save();
        res.status(201).json(prestito);
    } catch (e) { res.status(500).json({ message: "Errore server" }); }
});

app.post('/api/prestiti/restituisci', auth, async (req, res) => {
    const { prestitoId } = req.body;
    try {
        const prestito = await Prestito.findById(prestitoId);
        if (!prestito) return res.status(404).json({ message: "Prestito non trovato." });
        if (prestito.utente.toString() !== req.utente.id) return res.status(403).json({ message: "Non autorizzato." });

        prestito.restituito = true;
        await prestito.save();

        const libro = await Libro.findById(prestito.libro);
        if (libro) {
            libro.disponibile = true;
            await libro.save();
        }
        res.json({ message: "Libro restituito con successo." });
    } catch (e) { res.status(500).json({ message: "Errore server" }); }
});


// ==========================================
// === NUOVE ROTTE DASHBOARD & SEEDING ===
// ==========================================

// 1. SEED UTENTI (Crea 20 utenti finti)
app.post('/api/seed/utenti', auth, async (req, res) => {
    if (!req.utente.isAdmin) return res.sendStatus(403);

    try {
        const { count } = req.body; // <--- PRENDE IL NUMERO DAL FRONTEND
        const numero = Number(count);

        if (!numero || numero <= 0)
            return res.status(400).json({ message: "Count non valido" });

        const passwordHash = await bcrypt.hash("password123", 10);

        const utentiFinti = [];

        for (let i = 0; i < numero; i++) {  // <--- USA IL NUMERO DEL FRONTEND
            const sesso = faker.person.sexType(); 
            const nome = faker.person.firstName(sesso);
            const cognome = faker.person.lastName();
            
            utentiFinti.push({
                nome: `${nome} ${cognome}`,
                email: faker.internet.email({ firstName: nome, lastName: cognome }),
                password: passwordHash,
                genere: sesso === 'female' ? 'Femmina' : 'Maschio',
                eta: faker.number.int({ min: 18, max: 80 }),
                isAdmin: false
            });
        }

        await Utente.insertMany(utentiFinti);

        res.json({ message: `Creati ${numero} utenti fittizi!` });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});


// 2. SEED LIBRI (Crea 20 libri finti)
app.post('/api/seed/libri', auth, async (req, res) => {
    if (!req.utente.isAdmin) return res.sendStatus(403);

    try {
        const { count } = req.body;            // <--- PRENDE IL NUMERO DAL FRONTEND
        const numero = Number(count);

        if (!numero || numero <= 0)
            return res.status(400).json({ message: "Count non valido" });

        const libriFinti = [];
        const generi = ['Fantasy', 'Sci-Fi', 'Romanzo', 'Giallo', 'Storico', 'Horror'];

        for (let i = 0; i < numero; i++) {     // <--- USA IL NUMERO DEL FRONTEND
            libriFinti.push({
                titolo: faker.book.title(),
                autore: faker.book.author(),
                anno: faker.number.int({ min: 1950, max: 2024 }),
                genere: faker.helpers.arrayElement(generi),
                isbn: faker.commerce.isbn(),
                disponibile: true
            });
        }

        await Libro.insertMany(libriFinti);

        res.json({ message: `Creati ${numero} libri fittizi!` }); // <--- RISPOSTA CORRETTA
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// 3. SEED PRESTITI DI MASSA
app.post('/api/prestiti/massa', auth, async (req, res) => {
    if (!req.utente.isAdmin) return res.sendStatus(403);

    try {
        const { numUtenti, numPrestiti } = req.body;
        const countUtenti = Number(numUtenti);
        const countPrestiti = Number(numPrestiti);

        if (!countUtenti || !countPrestiti || countUtenti <= 0 || countPrestiti <= 0) {
            return res.status(400).json({ message: "Input non validi." });
        }

        // 1. Prendi utenti (non admin) e libri disponibili
        const utenti = await Utente.find({ isAdmin: false }).select('_id');
        const libriDisponibili = await Libro.find({ disponibile: true }).select('_id');

        if (utenti.length < countUtenti) {
            return res.status(400).json({ message: `Non ci sono abbastanza utenti (richiesti: ${countUtenti}, disponibili: ${utenti.length})` });
        }

        // 2. Seleziona utenti casuali
        const utentiCasuali = utenti.sort(() => 0.5 - Math.random()).slice(0, countUtenti);

        let prestitiCreati = 0;
        const libriDaAggiornare = new Set();

        // 3. Crea prestiti per ogni utente
        for (const utente of utentiCasuali) {
            // Filtra i libri già usati in questo ciclo
            const libriAncoraDisponibili = libriDisponibili.filter(l => !libriDaAggiornare.has(l._id.toString()));

            if (libriAncoraDisponibili.length === 0) break; // Non ci sono più libri

            const libriCasualiPerUtente = libriAncoraDisponibili.sort(() => 0.5 - Math.random()).slice(0, countPrestiti);
            
            const nuoviPrestiti = [];
            const dataRestituzione = new Date();
            dataRestituzione.setDate(dataRestituzione.getDate() + 30);

            for (const libro of libriCasualiPerUtente) {
                nuoviPrestiti.push({
                    utente: utente._id,
                    libro: libro._id,
                    dataRestituzionePrevista: dataRestituzione,
                });
                libriDaAggiornare.add(libro._id.toString());
                prestitiCreati++;
            }
            if (nuoviPrestiti.length > 0) {
                await Prestito.insertMany(nuoviPrestiti);
            }
        }

        // 4. Aggiorna la disponibilità dei libri usati
        await Libro.updateMany({ _id: { $in: Array.from(libriDaAggiornare) } }, { $set: { disponibile: false } });

        res.json({ message: `${prestitiCreati} prestiti creati con successo!` });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Errore durante la creazione dei prestiti di massa." });
    }
});


// 3. STATISTICHE DASHBOARD (Aggregazioni)
app.get('/api/dashboard/stats', auth, async (req, res) => {
    if(!req.utente.isAdmin) return res.sendStatus(403);
    try {
        // Conteggi Totali
        const totUtenti = await Utente.countDocuments();
        const totLibri = await Libro.countDocuments();
        const totPrestitiAttivi = await Prestito.countDocuments({ restituito: false });

        // Raggruppamento: Utenti per Genere
        const utentiPerGenere = await Utente.aggregate([
            { $group: { _id: "$genere", count: { $sum: 1 } } }
        ]);

        // Raggruppamento: Libri per Genere (Top 5)
        const libriPerGenere = await Libro.aggregate([
            { $group: { _id: "$genere", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Raggruppamento: Utenti per Fascia Età
        const utentiPerEta = await Utente.aggregate([
            {
                $bucket: {
                    groupBy: "$eta",
                    boundaries: [0, 20, 30, 50, 100],
                    default: "Other",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        // --- NUOVE STATISTICHE PRESTITI ---

        // Raggruppamento: Prestiti per Genere del Libro
        const prestitiPerGenere = await Prestito.aggregate([
            { $lookup: { from: 'Libri', localField: 'libro', foreignField: '_id', as: 'libroInfo' } },
            { $unwind: '$libroInfo' },
            { $group: { _id: '$libroInfo.genere', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Raggruppamento: Prestiti per Fascia d'Età dell'Utente
        const prestitiPerEta = await Prestito.aggregate([
            { $lookup: { from: 'Utenti', localField: 'utente', foreignField: '_id', as: 'userInfo' } },
            { $unwind: '$userInfo' },
            {
                $bucket: {
                    groupBy: "$userInfo.eta",
                    boundaries: [0, 20, 30, 50, 100],
                    default: "Other",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        // Raggruppamento: Prestiti per Genere dell'Utente
        const prestitiPerSesso = await Prestito.aggregate([
            { $lookup: { from: 'Utenti', localField: 'utente', foreignField: '_id', as: 'userInfo' } },
            { $unwind: '$userInfo' },
            { $group: { _id: '$userInfo.genere', count: { $sum: 1 } } }
        ]);


        res.json({
            kpi: { totUtenti, totLibri, totPrestitiAttivi },
            charts: {
                utentiGenere: utentiPerGenere.map(x => ({ name: x._id || 'Non spec.', value: x.count })),
                libriGenere: libriPerGenere.map(x => ({ name: x._id, Libri: x.count })),
                utentiEta: utentiPerEta.map(x => {
                    let label = "";
                    if(x._id === 0) label = "< 20";
                    else if(x._id === 20) label = "20-30";
                    else if(x._id === 30) label = "30-50";
                    else if(x._id === 50) label = "50+";
                    return { name: label, Utenti: x.count };
                }),
                // Aggiungiamo i nuovi dati
                prestitiPerGenere: prestitiPerGenere.map(x => ({ name: x._id, Prestiti: x.count })),
                prestitiPerEta: prestitiPerEta.map(x => {
                    let label = "";
                    if(x._id === 0) label = "< 20";
                    else if(x._id === 20) label = "20-30";
                    else if(x._id === 30) label = "30-50";
                    else if(x._id === 50) label = "50+";
                    return { name: label, Prestiti: x.count };
                }),
                prestitiSesso: prestitiPerSesso.map(x => ({ name: x._id || 'Non spec.', value: x.count }))
            }
        });
    } catch(e) { 
        console.error(e);
        res.status(500).json({message: "Errore statistiche"}); 
    }
});

app.listen(5000, () => console.log("Server su 5000"));