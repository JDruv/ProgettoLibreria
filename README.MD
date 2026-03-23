## PROGETTO LIBRERIA DIGITALE 

Un'applicazione web full-stack per la gestione di una libreria digitale. Il sistema permette agli utenti di registrarsi, visualizzare il catalogo e prendere in prestito dei libri. Gli amministratori hanno accesso a una dashboard completa per gestire utenti, libri, prestiti e visualizzare statistiche dettagliate.

## 🛠️ Tecnologie Utilizzate

* **Frontend:** React (Vite), React Router, Recharts (per i grafici)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (con Mongoose)
* **Autenticazione:** JSON Web Token (JWT) & bcryptjs

---

## 📋 Prerequisiti

Prima di avviare il progetto, assicurati di avere installato sul tuo computer:
* [Node.js](https://nodejs.org/)
* [MongoDB](https://www.mongodb.com/try/download/community) (in esecuzione localmente sulla porta standard `27017`)
* MongoDB Compass (consigliato per importare facilmente il database)

---

## 🚀 Istruzioni per l'Installazione e l'Avvio

### 1. Configurazione del Database (MongoDB)
Per far funzionare correttamente l'applicazione, è necessario caricare i dati iniziali:
1. Apri MongoDB Compass (o il tuo client MongoDB preferito).
2. Crea un nuovo database chiamato **`Libreria`**.
3. All'interno del database, crea tre collection: `Utenti`, `Prestiti` e `Libri`.
4. Importa all'interno di ciascuna collection il rispettivo file `.json` che trovi nella cartella `DatabaseMongoDB` del progetto (`Libreria.Utenti.json`, `Libreria.Prestiti.json`, `Libreria.Libri.json`).

### 2. Configurazione del Backend (Server)
Apri un terminale (o dividi il terminale su Visual Studio Code) e posizionati nella cartella del server:

```bash
cd server
npm install
