import React, { useState, useEffect } from 'react';
import '../styles/VisualizzaUtenti.css'; // Riutilizziamo lo stile esistente
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal'; // <-- 1. Importa Modale
import { useTranslation } from '../context/LanguageContext';

function IMieiPrestiti() {
  const [prestiti, setPrestiti] = useState([]);
  const [loading, setLoading] = useState(true); // Aggiunto stato loading
  
  // Stati per Notifiche e Modale
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loanToReturn, setLoanToReturn] = useState(null); // ID del prestito da restituire

  const showNotification = (msg, type='success') => setNotification({ message: msg, type });
  const closeNotification = () => setNotification({ message: '', type: '' });
  
  const token = localStorage.getItem('authToken');
  const t = useTranslation();

  // --- Caricamento Dati ---
  const caricaPrestiti = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/prestiti/mieiprestiti', { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Errore nel caricamento");
      setPrestiti(await res.json());
    } catch (e) {
      showNotification("Impossibile caricare i prestiti", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { caricaPrestiti(); }, []);

  // --- 2. Logica Modale ---
  
  // Apre il modale
  const handleReturnClick = (prestitoId) => {
    setLoanToReturn(prestitoId);
    setIsModalOpen(true);
  };

  // Esegue la restituzione (chiamata API)
  const handleConfirmReturn = async () => {
    if(!loanToReturn) return;

    try {
      const res = await fetch('http://localhost:5000/api/prestiti/restituisci', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prestitoId: loanToReturn })
      });

      const data = await res.json();
      
      if (res.ok) {
        showNotification(t('prestiti.returnedSuccess'), "success");
        caricaPrestiti(); // Ricarica la lista
      } else {
        showNotification(data.message || t('prestiti.connectionError'), "error");
      }
    } catch (e) {
      showNotification(t('prestiti.connectionError'), "error");
    } finally {
      setIsModalOpen(false);
      setLoanToReturn(null);
    }
  };

  if (loading) return <div className="loading" style={{textAlign:'center', marginTop:'50px'}}>{t('prestiti.loading')}</div>;

  return (
    <div className="visualizza-utenti-container">
      
      {/* Componenti UI */}
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={closeNotification} 
      />

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmReturn}
        title={t('prestiti.returnTitle')}
        confirmText={t('prestiti.returnConfirm')}
        confirmVariant="primary"
      >
        {t('prestiti.returnBody')}
      </ConfirmModal>


      <h1>{t('prestiti.headerTitle')}</h1>
      
      <div className="utenti-list">
        {prestiti.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px', color: '#888'}}>
            <p style={{fontSize: '1.2rem'}}>Non hai ancora preso nessun libro in prestito.</p>
          </div>
        ) : (
          prestiti.map(p => (
            <div key={p._id} className="utente-card">
               <div className="utente-info">
                 <p><strong>{t('prestiti.labelLibro')}</strong> {p.libro ? p.libro.titolo : t('prestiti.emptyState')}</p>
                 <p><strong>{t('prestiti.labelAutore')}</strong> {p.libro ? p.libro.autore : '-'}</p>
                 <p><strong>{t('prestiti.labelData')}</strong> {new Date(p.dataPrestito).toLocaleDateString()}</p>
                 <p><strong>{t('prestiti.labelStato')}</strong> {p.restituito ? <span style={{color:'var(--color-success)'}}>{t('prestiti.statusReturned')}</span> : <span style={{color:'orange'}}>{t('prestiti.statusOngoing')}</span>}</p>
               </div>
               
               {/* Mostra bottone solo se NON è stato restituito */}
               {!p.restituito && (
                 <div style={{marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                   <button 
                    className="btn-primary" 
                    style={{width: '100%'}}
                    onClick={() => handleReturnClick(p._id)}
                   >
                     {t('prestiti.returnBtn')}
                   </button>
                 </div>
               )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default IMieiPrestiti;