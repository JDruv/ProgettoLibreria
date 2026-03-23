import React, { createContext, useContext, useState, useMemo } from 'react';

const LanguageContext = createContext();

const translations = {
  it: {
    nav: {
      home: 'Home',
      gestione: 'Gestione Libri',
      utenti: 'Utenti & Prestiti',
      catalogo: 'Catalogo',
      mieiprestiti: 'I Miei Prestiti',
      logout: 'Logout'
    },
    home: {
      title: '📚 Libreria Digitale',
      subtitle: 'Il tuo catalogo personale di libri, sempre con te',
      description: "Organizza, gestisci e scopri la tua collezione di libri in un'unica piattaforma elegante e intuitiva.",
      manageBtn: 'Gestisci la Libreria',
      exploreBtn: 'Esplora il Catalogo',
      featuresTitle: 'Perché Scegliere Libreria Digitale?',
      feature1: { title: 'Organizzazione Semplice', desc: 'Aggiungi, modifica e elimina libri con pochi click. Niente complicazioni.' },
      feature2: { title: 'Catalogo Completo', desc: 'Visualizza tutti i tuoi libri in una comoda griglia con informazioni dettagliate.' },
      feature3: { title: 'Tema Scuro Elegante', desc: "Un'interfaccia moderna e sofisticata che non stanca gli occhi durante la lettura." },
      feature4: { title: 'Responsive Design', desc: 'Accedi da qualsiasi dispositivo: desktop, tablet o smartphone.' },
      feature5: { title: 'Generi e Metadati', desc: 'Categorizza i tuoi libri per genere, autore e anno di pubblicazione.' },
      feature6: { title: 'Veloce e Affidabile', desc: 'Prestazioni ottimali e sincronizzazione istantanea dei tuoi dati.' },
      stats1: 'Libri Illimitati',
      stats2: 'Tuo Controllo',
      stats3: 'Ultra Veloce',
      howTitle: 'Come Funziona?',
      step1: { title: 'Accedi o Registrati', desc: 'Crea un account in pochi secondi con la tua email.' },
      step2: { title: 'Esplora il Catalogo', desc: 'Sfoglia la collezione e trova i libri che ti interessano.' },
      step3: { title: 'Prendi in Prestito', desc: 'Con un click aggiungi il libro ai tuoi prestiti personali.' },
      step4: { title: 'Goditi la Lettura', desc: 'Accedi da qualsiasi luogo alla tua libreria personale.' },
      ctaTitle: 'Pronto a Iniziare?',
      ctaDesc: 'Organizza la tua collezione di libri oggi stesso',
      ctaBtn: 'Vai al',
      footer: '© 2025 Libreria Digitale • Una piattaforma moderna per appassionati di libri'
    }
    ,
    auth: {
      logo: 'Libreria',
      loginTitle: 'Accedi.',
      loginEmailPlaceholder: 'Email',
      loginPasswordPlaceholder: 'Password',
      loginButton: 'Accedi',
      noAccount: 'No account?',
      registerLink: 'Registrati',
      registerTitle: 'Crea il tuo account locale.',
      namePlaceholder: 'Nome Completo',
      emailPlaceholder: 'Indirizzo Email',
      passwordPlaceholder: 'Scegli una Password',
      registerButton: 'Registrati',
      haveAccount: 'Hai già un account?',
      loginLink: 'Accedi',
      registerSuccess: 'Registrazione avvenuta! Ora puoi accedere.',
      serverError: 'Errore server',
      connectionError: 'Errore di connessione col server.'
    },
    common: {
      cancel: 'Annulla',
      confirm: 'Conferma'
    },
    catalog: {
      confirmTitle: 'Conferma Prestito',
      confirmText: 'Sì, Prendi in Prestito',
      modalBody: 'Sei sicuro di voler prendere in prestito il libro: ',
      headerTitle: '📖 Catalogo Libri',
      headerSubtitle: 'Scegli il tuo prossimo libro',
      takeTooltip: 'Prendi in prestito',
      occupied: 'Occupato',
      authorLabel: 'Autore:',
      genreLabel: 'Genere:',
      borrowedSuccess: 'Libro preso in prestito!',
      serverError: 'Errore server'
    },
    gestione: {
      headerTitle: '📚 Gestione Libri',
      headerSubtitle: 'Area Amministrativa',
      addBtn: '+ Aggiungi Libro',
      cancelBtn: '✕ Annulla',
      confirmDeleteTitle: 'Conferma Eliminazione',
      confirmDeleteText: 'Sì, Elimina',
      deleteSuccess: 'Libro eliminato!',
      addSuccess: 'Libro aggiunto!',
      editSuccess: 'Modifica salvata!',
      formNewTitle: 'Nuovo Libro',
      formEditTitle: 'Modifica Libro',
      labelTitolo: 'Titolo *',
      labelAutore: 'Autore *',
      labelAnno: 'Anno',
      labelGenere: 'Genere',
      labelISBN: 'ISBN',
      saveChanges: 'Salva Modifiche',
      saveBook: 'Salva Libro',
      validationRequired: 'Titolo e autore obbligatori',
      noBooks: 'Nessun libro trovato.',
      editBtn: 'Modifica',
      deleteBtn: 'Elimina',
      loading: 'Caricamento...'
    },
    prestiti: {
      returnTitle: 'Restituzione Libro',
      returnConfirm: 'Sì, Restituisci',
      returnBody: 'Sei sicuro di voler restituire questo libro alla biblioteca?',
      headerTitle: '📚 I Miei Prestiti',
      loading: 'Caricamento prestiti...',
      emptyState: 'Non hai ancora preso nessun libro in prestito.',
      labelLibro: 'Libro:',
      labelAutore: 'Autore:',
      labelData: 'Data Prestito:',
      labelStato: 'Stato:',
      statusReturned: 'Restituito',
      statusOngoing: 'In corso',
      returnBtn: 'Restituisci Libro',
      returnedSuccess: 'Libro restituito con successo!',
      connectionError: 'Errore di connessione'
    },
    utenti: {
      headerTitle: '👥 Elenco Utenti Registrati',
      loading: 'Caricamento utenti...',
      noUsers: 'Nessun utente trovato.',
      noLoans: 'Nessun prestito da mostrare.',
      loansActive: 'Prestiti in Corso',
      loansReturned: 'Prestiti Restituiti',
      inProgress: ' (In Corso)',
      returned: ' (Restituito)',
      nameLabel: 'Nome:',
      emailLabel: 'Email:',
      sinceLabel: 'Dal:',
      editBtn: 'Modifica',
      deleteBtn: 'Elimina',
      editTitle: 'Modifica Utente',
      deleteTitle: 'Elimina Utente',
      labelName: 'Nome *',
      labelEmail: 'Email *',
      saveChanges: 'Salva Modifiche',
      updateSuccess: 'Utente aggiornato con successo!',
      deleteSuccess: 'Utente eliminato con successo!',
      validationRequired: 'Nome e email sono obbligatori'
    }
  },
  en: {
    nav: {
      home: 'Home',
      gestione: 'Manage Books',
      utenti: 'Users & Loans',
      catalogo: 'Catalog',
      mieiprestiti: 'My Loans',
      logout: 'Logout'
    },
    home: {
      title: '📚 Digital Library',
      subtitle: 'Your personal book catalog, always with you',
      description: 'Organize, manage and discover your book collection in one elegant and intuitive platform.',
      manageBtn: 'Manage Library',
      exploreBtn: 'Explore Catalog',
      featuresTitle: 'Why Choose Digital Library?',
      feature1: { title: 'Simple Organization', desc: 'Add, edit and delete books with a few clicks. No fuss.' },
      feature2: { title: 'Complete Catalog', desc: 'View all your books in a handy grid with detailed info.' },
      feature3: { title: 'Elegant Dark Theme', desc: "A modern interface that won’t tire your eyes while reading." },
      feature4: { title: 'Responsive Design', desc: 'Access from any device: desktop, tablet or smartphone.' },
      feature5: { title: 'Genres & Metadata', desc: 'Categorize your books by genre, author and publication year.' },
      feature6: { title: 'Fast & Reliable', desc: 'Top performance and instant sync of your data.' },
      stats1: 'Unlimited Books',
      stats2: 'Your Control',
      stats3: 'Lightning Fast',
      howTitle: 'How It Works?',
      step1: { title: 'Login or Register', desc: 'Create an account in seconds with your email.' },
      step2: { title: 'Explore the Catalog', desc: 'Browse the collection and find books you like.' },
      step3: { title: 'Borrow', desc: 'With one click add the book to your personal loans.' },
      step4: { title: 'Enjoy Reading', desc: 'Access your personal library from anywhere.' },
      ctaTitle: "Ready to Start?",
      ctaDesc: 'Organize your book collection today',
      ctaBtn: 'Go to',
      footer: '© 2025 Digital Library • A modern platform for book lovers'
    }
    ,
    auth: {
      logo: 'Library',
      loginTitle: 'Sign in.',
      loginEmailPlaceholder: 'Email',
      loginPasswordPlaceholder: 'Password',
      loginButton: 'Sign In',
      noAccount: 'No account?',
      registerLink: 'Register',
      registerTitle: 'Create your local account.',
      namePlaceholder: 'Full Name',
      emailPlaceholder: 'Email Address',
      passwordPlaceholder: 'Choose a Password',
      registerButton: 'Register',
      haveAccount: 'Already have an account?',
      loginLink: 'Sign In',
      registerSuccess: 'Registration complete! You can now sign in.',
      serverError: 'Server error',
      connectionError: 'Unable to connect to server.'
    },
    common: {
      cancel: 'Cancel',
      confirm: 'Confirm'
    },
    catalog: {
      confirmTitle: 'Confirm Borrow',
      confirmText: 'Yes, Borrow',
      modalBody: 'Are you sure you want to borrow the book: ',
      headerTitle: '📖 Book Catalog',
      headerSubtitle: 'Choose your next read',
      takeTooltip: 'Borrow',
      occupied: 'Occupied',
      authorLabel: 'Author:',
      genreLabel: 'Genre:',
      borrowedSuccess: 'Book borrowed!',
      serverError: 'Server error'
    },
    gestione: {
      headerTitle: '📚 Manage Books',
      headerSubtitle: 'Admin Area',
      addBtn: '+ Add Book',
      cancelBtn: '✕ Cancel',
      confirmDeleteTitle: 'Confirm Deletion',
      confirmDeleteText: 'Yes, Delete',
      deleteSuccess: 'Book deleted!',
      addSuccess: 'Book added!',
      editSuccess: 'Changes saved!',
      formNewTitle: 'New Book',
      formEditTitle: 'Edit Book',
      labelTitolo: 'Title *',
      labelAutore: 'Author *',
      labelAnno: 'Year',
      labelGenere: 'Genre',
      labelISBN: 'ISBN',
      saveChanges: 'Save Changes',
      saveBook: 'Save Book',
      validationRequired: 'Title and author are required',
      noBooks: 'No books found.',
      editBtn: 'Edit',
      deleteBtn: 'Delete',
      loading: 'Loading...'
    },
    prestiti: {
      returnTitle: 'Return Book',
      returnConfirm: 'Yes, Return',
      returnBody: 'Are you sure you want to return this book to the library?',
      headerTitle: '📚 My Loans',
      loading: 'Loading loans...',
      emptyState: "You haven't borrowed any books yet.",
      labelLibro: 'Book:',
      labelAutore: 'Author:',
      labelData: 'Borrow Date:',
      labelStato: 'Status:',
      statusReturned: 'Returned',
      statusOngoing: 'Ongoing',
      returnBtn: 'Return Book',
      returnedSuccess: 'Book returned successfully!',
      connectionError: 'Connection error'
    },
    utenti: {
      headerTitle: '👥 Registered Users',
      loading: 'Loading users...',
      noUsers: 'No users found.',
      noLoans: 'No loans to show.',
      loansActive: 'Active Loans',
      loansReturned: 'Returned Loans',
      inProgress: ' (Ongoing)',
      returned: ' (Returned)',
      nameLabel: 'Name:',
      emailLabel: 'Email:',
      sinceLabel: 'Since:',
      editBtn: 'Edit',
      deleteBtn: 'Delete',
      editTitle: 'Edit User',
      deleteTitle: 'Delete User',
      labelName: 'Name *',
      labelEmail: 'Email *',
      saveChanges: 'Save Changes',
      updateSuccess: 'User updated successfully!',
      deleteSuccess: 'User deleted successfully!',
      validationRequired: 'Name and email are required'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('lang') || 'it';
    } catch (e) {
      return 'it';
    }
  });

  const toggle = () => {
    setLang(l => {
      const next = l === 'it' ? 'en' : 'it';
      try { localStorage.setItem('lang', next); } catch (e) {}
      return next;
    });
  };

  const value = useMemo(() => ({ lang, setLang, toggle, t: (key) => {
    const parts = key.split('.');
    let cur = translations[lang];
    for (const p of parts) {
      cur = cur?.[p];
      if (cur === undefined) return key;
    }
    return cur;
  }}), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
export const useTranslation = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) return (k) => k;
  return ctx.t;
};

export default LanguageContext;
