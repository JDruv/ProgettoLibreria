import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // Stato per tracciare errori
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [seedType, setSeedType] = useState(null);
  const [seedCountInput, setSeedCountInput] = useState('20');
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanUserInput, setLoanUserInput] = useState('10');
  const [loanBookInput, setLoanBookInput] = useState('5');

  const token = localStorage.getItem('authToken');
  const showNotification = (msg, type='success') => setNotification({ message: msg, type });

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Errore server");
      const data = await res.json();
      setStats(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError(true); // Segnala l'errore
      setLoading(false);
      // Non mostriamo la notifica qui per evitare loop se il server è giù
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleSeed = async (type, count) => {
    try {
      const res = await fetch(`http://localhost:5000/api/seed/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ count })
      });
      if(res.ok) {
        showNotification(`${count} ${type} aggiunti con successo!`, "success");
        fetchStats(); 
      } else {
        showNotification("Errore generazione", "error");
      }
    } catch(e) { showNotification("Errore connessione", "error"); }
  };

  const openSeedModal = (type) => {
    setSeedType(type);
    setSeedCountInput('20');
    setIsSeedModalOpen(true);
  };

  const confirmSeed = () => {
    const valore = Number(seedCountInput);
    if (!valore || isNaN(valore) || valore <= 0) {
      showNotification('Count non valido', 'error');
      return;
    }
    setIsSeedModalOpen(false);
    handleSeed(seedType, valore);
  };

  const handleLoanGeneration = async () => {
    const numUtenti = Number(loanUserInput);
    const numPrestiti = Number(loanBookInput);

    if (!numUtenti || !numPrestiti || numUtenti <= 0 || numPrestiti <= 0) {
      showNotification('Input non validi', 'error');
      return;
    }

    setIsLoanModalOpen(false);

    try {
      const res = await fetch('http://localhost:5000/api/prestiti/massa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ numUtenti, numPrestiti })
      });
      
      const data = await res.json();

      if (res.ok) {
        showNotification(data.message, 'success');
        fetchStats(); // Aggiorna le statistiche
      } else {
        showNotification(data.message || 'Errore durante la generazione', 'error');
      }
    } catch (e) {
      showNotification('Errore di connessione al server', 'error');
    }
  };

  if (loading) return <div className="loading">Caricamento Dashboard...</div>;
  
  // --- PROTEZIONE ANTI-CRASH ---
  if (error || !stats) return (
    <div className="dashboard-container" style={{textAlign:'center', padding:'50px'}}>
      <h2 style={{color:'var(--color-danger)'}}>Impossibile caricare i dati</h2>
      <p style={{color:'#888'}}>Assicurati che il server sia acceso e che tu abbia installato "@faker-js/faker" nel backend.</p>
      <button className="btn-primary" onClick={fetchStats} style={{marginTop:'20px'}}>Riprova</button>
    </div>
  );
  // -----------------------------

  return (
    <div className="dashboard-container">
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({})} />
      <div className="dashboard-header">
        <h1>Dashboard Amministratore</h1>
        <p className="dashboard-subtitle">Panoramica e Strumenti di Sviluppo</p>
      </div>

      <div className="tools-section">
        <h3 className="tools-title">🛠️ Generatore Dati (Testing)</h3>
        <div className="tools-buttons">
            <button className="btn-primary" onClick={() => openSeedModal('utenti')}>Inserisci Utenti</button>

            <button className="btn-primary" onClick={() => openSeedModal('libri')}>Inserisci Libri</button>
            <button className="btn-secondary" onClick={() => setIsLoanModalOpen(true)}>Genera Prestiti</button>
        </div>
        <p className="tools-note">Password utenti generati: <strong>password123</strong></p>
      </div>
      {/* Modale per inserimento seed (utenti/libri) */}
      <ConfirmModal
        isOpen={isSeedModalOpen}
        onClose={() => setIsSeedModalOpen(false)}
        onConfirm={confirmSeed}
        title={seedType === 'utenti' ? 'Genera Utenti' : 'Genera Libri'}
        confirmText={`Genera`}
        confirmVariant="primary"
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ minWidth: '80px' }}>Quantità:</label>
          <input type="number" min="1" className="form-field" style={{ width: '120px' }} value={seedCountInput} onChange={(e) => setSeedCountInput(e.target.value)} />
        </div>
      </ConfirmModal>

      {/* Modale per generazione prestiti */}
      <ConfirmModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onConfirm={handleLoanGeneration}
        title="Genera Prestiti Massivi"
        confirmText="Genera Prestiti"
        confirmVariant="secondary"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ minWidth: '120px' }}>N. Utenti (casuali):</label>
            <input type="number" min="1" className="form-field" style={{ width: '120px' }} value={loanUserInput} onChange={(e) => setLoanUserInput(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ minWidth: '120px' }}>N. Libri per utente:</label>
            <input type="number" min="1" className="form-field" style={{ width: '120px' }} value={loanBookInput} onChange={(e) => setLoanBookInput(e.target.value)} />
          </div>
        </div>
      </ConfirmModal>

      <div className="kpi-grid">
        <KpiCard title="Totale Utenti" value={stats.kpi.totUtenti} icon="👥" color="#0088FE" />
        <KpiCard title="Totale Libri" value={stats.kpi.totLibri} icon="📚" color="#00C49F" />
        <KpiCard title="Prestiti Attivi" value={stats.kpi.totPrestitiAttivi} icon="📖" color="#FFBB28" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Utenti per Genere</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.charts.utentiGenere} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                {stats.charts.utentiGenere.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: 'var(--color-bg-dark)', border: '1px solid var(--color-border)'}} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top Generi Libri</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.charts.libriGenere}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{backgroundColor: 'var(--color-bg-dark)', border: '1px solid var(--color-border)'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Bar dataKey="Libri" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Fasce d'Età Utenti</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.charts.utentiEta}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{backgroundColor: 'var(--color-bg-dark)', border: '1px solid var(--color-border)'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Bar dataKey="Utenti" fill="#FF8042" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Nuova riga di grafici per i prestiti */}
        <div className="chart-card">
            <h3 className="chart-title">Prestiti per Categoria Libro</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.charts.prestitiPerGenere}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{backgroundColor: 'var(--color-bg-dark)', border: '1px solid var(--color-border)'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="Prestiti" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="chart-card">
            <h3 className="chart-title">Prestiti per Fascia d'Età Utente</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.charts.prestitiPerEta}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{backgroundColor: 'var(--color-bg-dark)', border: '1px solid var(--color-border)'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="Prestiti" fill="#00C49F" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="chart-card">
            <h3 className="chart-title">Prestiti per Genere Utente</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={stats.charts.prestitiSesso} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                        {stats.charts.prestitiSesso.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: 'var(--color-bg-dark)', border: '1px solid var(--color-border)'}} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, color }) => (
  <div className="kpi-card" style={{ borderLeft: `5px solid ${color}` }}>
    <div className="kpi-icon" style={{ color: color }}>{icon}</div>
    <div className="kpi-info">
      <h4>{title}</h4>
      <span className="kpi-value">{value}</span>
    </div>
  </div>
);

export default Dashboard;
