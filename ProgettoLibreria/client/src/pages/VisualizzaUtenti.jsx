import React, { useState, useEffect } from 'react';
import '../styles/VisualizzaUtenti.css';
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal';
import { useTranslation } from '../context/LanguageContext';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

// --- NUOVO SOTTO-COMPONENTE PER L'ACCORDION ---
const PrestitoAccordion = ({ prestito, tipo }) => { // tipo = 'attivo' o 'storico'
  const [isOpen, setIsOpen] = useState(false);
  const libro = prestito.libro;

  // Se il libro è stato eliminato dal database, gestiamo l'errore
  if (!libro) return (
    <li className="prestito-item" style={{padding: '10px', color: '#666'}}>
      <em>Libro eliminato dal database</em>
    </li>
  );

  return (
    <li className="prestito-item">
      {/* Header Cliccabile */}
      <div className="prestito-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="prestito-main-info">
          <strong>{libro.titolo}</strong>
          {tipo === 'attivo' ? (
            <span className="in-corso">In Corso</span>
          ) : (
            <span className="restituito">Restituito</span>
          )}
        </div>
        
        {/* Icona Freccia che ruota */}
        <div className={`arrow-icon ${isOpen ? 'open' : ''}`}>
          ▼
        </div>
      </div>

      {/* Dettagli a comparsa */}
      {isOpen && (
        <div className="prestito-details">
          <div className="detail-row">
            <span className="detail-label">Autore:</span>
            <span>{libro.autore}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Anno:</span>
            <span>{libro.anno || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Genere:</span>
            <span>{libro.genere || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">ISBN:</span>
            <span>{libro.isbn || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Data Prestito:</span>
            <span>{new Date(prestito.dataPrestito).toLocaleDateString()}</span>
          </div>
          {prestito.restituito && (
             <div className="detail-row">
               <span className="detail-label">Restituito il:</span>
               <span>{new Date(prestito.dataRestituzionePrevista).toLocaleDateString()}</span> {/* Nota: qui si potrebbe usare un campo dataRestituzioneEffettiva se esistesse */}
             </div>
          )}
        </div>
      )}
    </li>
  );
};


function VisualizzaUtenti() {
  const [utenti, setUtenti] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editingUtente, setEditingUtente] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editForm, setEditForm] = useState({ nome: '', email: '' });

  const t = useTranslation();

  const showNotification = (message, type = 'success') => setNotification({ message, type });
  const closeNotification = () => setNotification({ message: '', type: '' });

  const caricaUtenti = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/utenti', { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Errore caricamento utenti.');
      setUtenti(await response.json());
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { caricaUtenti(); }, []);

  // ... (Le funzioni handleEditClick, handleSaveEdit, handleDeleteClick, handleConfirmDelete rimangono UGUALI a prima) ...
  const handleEditClick = (utente) => {
    setEditingUtente(utente);
    setEditForm({ nome: utente.nome, email: utente.email });
    setIsModalOpen(true);
  };
  const handleSaveEdit = async () => {
     if (!editForm.nome || !editForm.email) { showNotification("Dati mancanti", 'error'); return; }
     try {
        const res = await fetch(`http://localhost:5000/api/utenti/${editingUtente._id}`, {
            method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(editForm)
        });
        if(!res.ok) throw new Error("Errore update");
        setUtenti(utenti.map(u => u._id === editingUtente._id ? {...u, ...editForm} : u));
        showNotification("Utente aggiornato", "success");
        setIsModalOpen(false);
     } catch(e) { showNotification(e.message, 'error'); }
  };
  const handleDeleteClick = (utente) => {
    const haPrestiti = utente.prestiti && utente.prestiti.some(p => !p.restituito);
    if(haPrestiti) { showNotification("Impossibile eliminare: ha prestiti in corso", "error"); return; }
    setUserToDelete(utente);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if(!userToDelete) return;
    try {
        const res = await fetch(`http://localhost:5000/api/utenti/${userToDelete._id}`, { method: 'DELETE', headers: getAuthHeaders() });
        if(!res.ok) throw new Error("Errore delete");
        setUtenti(utenti.filter(u => u._id !== userToDelete._id));
        showNotification("Utente eliminato", "success");
    } catch(e) { showNotification(e.message, 'error'); } finally { setIsDeleteModalOpen(false); }
  };


  if (loading) return <div className="loading">{t('utenti.loading') || "Caricamento..."}</div>;

  // --- Renderizzazione Liste Prestiti usando il nuovo Componente ---
  const renderPrestiti = (prestiti) => {
    if (!prestiti || prestiti.length === 0) {
      return <p className="no-prestiti">{t('utenti.noLoans') || "Nessun prestito."}</p>;
    }

    const attivi = prestiti.filter(p => !p.restituito);
    const restituiti = prestiti.filter(p => p.restituito);

    return (
      <div className="prestiti-section">
        {attivi.length > 0 && (
           <>
            <h4 style={{color: 'var(--color-danger)'}}>In Corso ({attivi.length})</h4>
            <ul className="prestiti-list">
              {attivi.map(p => (
                // Usiamo il nuovo componente qui!
                <PrestitoAccordion key={p._id} prestito={p} tipo="attivo" />
              ))}
            </ul>
           </>
        )}

        {restituiti.length > 0 && (
          <>
            <h4 style={{marginTop: '15px', color: 'var(--color-success)'}}>Storico ({restituiti.length})</h4>
            <ul className="prestiti-list">
              {restituiti.map(p => (
                // Usiamo il nuovo componente anche qui!
                <PrestitoAccordion key={p._id} prestito={p} tipo="storico" />
              ))}
            </ul>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="visualizza-utenti-container">
      <Notification message={notification.message} type={notification.type} onClose={closeNotification} />
      
      {/* Modale Modifica */}
      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleSaveEdit} title="Modifica Utente" confirmText="Salva" confirmVariant="primary">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div><label>Nome</label><input type="text" className="form-field" value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} /></div>
          <div><label>Email</label><input type="email" className="form-field" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
        </div>
      </ConfirmModal>

      {/* Modale Elimina */}
      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Elimina Utente" confirmText="Elimina" confirmVariant="danger">
        Sei sicuro di voler eliminare <strong>{userToDelete?.nome}</strong>?
      </ConfirmModal>

      <h1>{t('utenti.headerTitle') || "Gestione Utenti"}</h1>
      
      <div className="utenti-list">
        {utenti.length === 0 ? <p>Nessun utente trovato.</p> : utenti.map((utente) => (
            <div key={utente._id} className="utente-card">
              <div className="utente-info">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                    <div>
                        <p><strong>Nome:</strong> {utente.nome} {utente.isAdmin && <span style={{color:'gold'}}>★ Admin</span>}</p>
                        <p><strong>Email:</strong> {utente.email}</p>
                        <p><strong>Iscritto dal:</strong> {new Date(utente.dataRegistrazione).toLocaleDateString()}</p>
                    </div>
                    <div className="user-actions">
                      <button 
                        className="btn-user-edit" 
                        onClick={() => handleEditClick(utente)}
                      >
                        Modifica
                      </button>
                      
                      {!utente.isAdmin && (
                          <button 
                            className="btn-user-delete" 
                            onClick={() => handleDeleteClick(utente)} 
                          >
                            Elimina
                          </button>
                      )}
                    </div>
                </div>
              </div>
              {/* Renderizza i prestiti con l'accordion */}
              {renderPrestiti(utente.prestiti)}
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default VisualizzaUtenti;