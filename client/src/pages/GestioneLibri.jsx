import React, { useState, useEffect } from 'react';
import '../styles/GestioneLibri.css';
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal';
import { useTranslation } from '../context/LanguageContext';

// Icona Cestino
const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

function GestioneLibri() {
  const [libri, setLibri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  
  const [nuovoLibro, setNuovoLibro] = useState({ titolo: '', autore: '', anno: '', genere: '', isbn: '' });
  const [mostraForm, setMostraForm] = useState(false);
  const [editingLibro, setEditingLibro] = useState(null); 

  const showNotification = (message, type = 'success') => setNotification({ message, type });
  const closeNotification = () => setNotification({ message: '', type: '' });
  const t = useTranslation();

  const caricaLibri = async () => {
    try {
      // Non mettiamo setLoading(true) qui per evitare sfarfallii durante l'update se chiamato dopo
      const response = await fetch('http://localhost:5000/api/libri', { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Errore caricamento');
      const data = await response.json();
      setLibri(data);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { caricaLibri(); }, []);

  const handleInputChange = (e) => setNuovoLibro({ ...nuovoLibro, [e.target.name]: e.target.value });
  
  const resetForm = () => {
    setNuovoLibro({ titolo: '', autore: '', anno: '', genere: '', isbn: '' });
    setEditingLibro(null);
    setMostraForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuovoLibro.titolo || !nuovoLibro.autore) {
      showNotification(t('gestione.validationRequired'), 'error');
      return;
    }

    const url = editingLibro 
      ? `http://localhost:5000/api/libri/${editingLibro._id}`
      : 'http://localhost:5000/api/libri';
    
    const method = editingLibro ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(nuovoLibro)
      });
      
      const data = await response.json(); // Ora contiene il libro completo!

      if (!response.ok) throw new Error(data.message || t('gestione.loading'));

      // AGGIORNAMENTO LISTA:
      if (editingLibro) {
        setLibri(libri.map(l => (l._id === editingLibro._id ? data : l)));
      } else {
        setLibri([...libri, data]);
      }
      
      showNotification(editingLibro ? t('gestione.editSuccess') : t('gestione.addSuccess'), 'success');
      resetForm();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleEditClick = (libro) => {
    setEditingLibro(libro);
    setNuovoLibro({
      titolo: libro.titolo,
      autore: libro.autore,
      anno: libro.anno || '',
      genere: libro.genere || '',
      isbn: libro.isbn || ''
    });
    setMostraForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    setBookToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/libri/${bookToDelete}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Errore eliminazione");

      setLibri(libri.filter(libro => libro._id !== bookToDelete));
      showNotification(t('gestione.deleteSuccess'), 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsModalOpen(false);
      setBookToDelete(null);
    }
  };

  if (loading) return <div className="gestione-container"><div className="loading">{t('gestione.loading')}</div></div>;

  return (
    <div className="gestione-container">
      <Notification message={notification.message} type={notification.type} onClose={closeNotification} />
      
      {/* Modale Aggiornato */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('gestione.confirmDeleteTitle')}
        confirmText={t('gestione.confirmDeleteText')}
        confirmVariant="danger"
      >
        {t('gestione.confirmDeleteTitle')}
      </ConfirmModal>

      <div className="gestione-header">
        <h1>{t('gestione.headerTitle')}</h1>
        <p className="gestione-subtitle">{t('gestione.headerSubtitle')}</p>
      </div>

      <button className="btn-primary btn-add-libro" onClick={() => mostraForm ? resetForm() : setMostraForm(true)}>
        {mostraForm ? t('gestione.cancelBtn') : t('gestione.addBtn')}
      </button>

      {mostraForm && (
        <div className="libro-form-container">
          <form onSubmit={handleSubmit} className="libro-form">
            <h2 style={{textAlign:'center', color:'var(--color-primary)'}}>
              {editingLibro ? t('gestione.formEditTitle') : t('gestione.formNewTitle')}
            </h2>
            <div className="form-row">
              <div className="form-group"><label>{t('gestione.labelTitolo')}</label><input type="text" name="titolo" className="form-field" value={nuovoLibro.titolo} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>{t('gestione.labelAutore')}</label><input type="text" name="autore" className="form-field" value={nuovoLibro.autore} onChange={handleInputChange} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>{t('gestione.labelAnno')}</label><input type="number" name="anno" className="form-field" value={nuovoLibro.anno} onChange={handleInputChange} /></div>
              <div className="form-group"><label>{t('gestione.labelGenere')}</label><input type="text" name="genere" className="form-field" value={nuovoLibro.genere} onChange={handleInputChange} /></div>
            </div>
            <div className="form-group"><label>{t('gestione.labelISBN')}</label><input type="text" name="isbn" className="form-field" value={nuovoLibro.isbn} onChange={handleInputChange} /></div>
            <button type="submit" className="btn-primary">{editingLibro ? t('gestione.saveChanges') : t('gestione.saveBook')}</button>
          </form>
        </div>
      )}

      <div className="libri-container">
        {libri.length === 0 ? <div className="empty-state"><p>{t('gestione.noBooks')}</p></div> : (
          <div className="libri-grid">
            {libri.map((libro) => (
              <div key={libro._id} className="libro-card">
                <div className="libro-card-header"><h3 className="libro-titolo">{libro.titolo}</h3></div>
                <div className="libro-info">
                  <p><span className="label">{t('gestione.labelAutore')}</span> {libro.autore}</p>
                  {libro.anno && <p><span className="label">{t('gestione.labelAnno')}</span> {libro.anno}</p>}
                  {libro.genere && <p><span className="label">{t('gestione.labelGenere')}</span> <span className="genere-badge">{libro.genere}</span></p>}
                  {libro.isbn && <p><span className="label">{t('gestione.labelISBN')}</span> {libro.isbn}</p>}
                </div>
                <div className="libro-card-actions">
                  <button className="btn-edit" onClick={() => handleEditClick(libro)}>{t('gestione.editBtn')}</button>
                  <button className="btn-delete" onClick={() => handleDeleteClick(libro._id)}><TrashIcon /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GestioneLibri;