import React, { useState, useEffect } from 'react';
import '../styles/GestioneLibri.css'; // Riutilizziamo lo stile
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal'; // <-- 1. Importa il Modale
import { useTranslation } from '../context/LanguageContext';

function CatalogoLibri() {
  const [libri, setLibri] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  // --- 2. Stati per il Modale ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookToBorrow, setBookToBorrow] = useState(null); // Salva il libro da prestare

  const showNotification = (msg, type='success') => setNotification({ message: msg, type });
  const token = localStorage.getItem('authToken');
  const t = useTranslation();

  const caricaLibri = async () => {
    const res = await fetch('http://localhost:5000/api/libri', { headers: { 'Authorization': `Bearer ${token}` }});
    const data = await res.json();
    setLibri(data);
  };

  useEffect(() => { caricaLibri(); }, []);

  // --- 3. Funzioni Modale ---
  
  // APRE il modale quando clicchi +
  const handleBorrowClick = (libro) => {
    setBookToBorrow(libro);
    setIsModalOpen(true);
  };

  // ESEGUE il prestito quando confermi
  const handleConfirmBorrow = async () => {
    if (!bookToBorrow) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/prestiti/prendi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ libroId: bookToBorrow._id })
      });
      const data = await res.json();
      if(res.ok) {
        showNotification(t('catalog.borrowedSuccess'), "success");
        caricaLibri(); // Ricarica per aggiornare disponibilità
      } else {
        showNotification(data.message || t('catalog.serverError'), "error");
      }
    } catch(e) { 
      showNotification(t('catalog.serverError'), "error"); 
    } finally {
      setIsModalOpen(false); // Chiudi il modale
      setBookToBorrow(null); // Resetta
    }
  };

  return (
    <div className="gestione-container">
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
      
      {/* --- 4. Aggiungi il Modale al JSX --- */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmBorrow}
        title={t('catalog.confirmTitle')}
        confirmText={t('catalog.confirmText')}
        confirmVariant="primary"
      >
        {/* Mostra il titolo del libro nel modale */}
        {t('catalog.modalBody')} <strong>{bookToBorrow?.titolo}</strong>?
      </ConfirmModal>

      <div className="gestione-header">
        <h1>{t('catalog.headerTitle')}</h1>
        <p className="gestione-subtitle">{t('catalog.headerSubtitle')}</p>
      </div>

      <div className="libri-grid">
        {libri.map((libro) => (
          <div key={libro._id} className="libro-card" style={{ opacity: libro.disponibile ? 1 : 0.6 }}>
            <div className="libro-card-header">
              <h3 className="libro-titolo">{libro.titolo}</h3>
              {libro.disponibile ? (
                <button 
                  className="btn-primary" 
                  style={{width: '40px', height: '40px', padding: 0, borderRadius: '50%'}}
                  onClick={() => handleBorrowClick(libro)} // <-- 5. Modifica OnClick
                  title={t('catalog.takeTooltip')}
                >
                  +
                </button>
              ) : (
                <span style={{color: 'orange', fontWeight: 'bold'}}>{t('catalog.occupied')}</span>
              )}
            </div>
            <div className="libro-info">
              <p><span className="label">{t('catalog.authorLabel')}</span> {libro.autore}</p>
              {libro.genere && <p><span className="label">{t('catalog.genreLabel')}</span> {libro.genere}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default CatalogoLibri;