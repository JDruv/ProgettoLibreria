import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // Stato per evitare il redirect mentre controlliamo il localStorage
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('authToken');
      const adminFlag = localStorage.getItem('isAdmin');
      
      if (token) {
        setIsAuthenticated(true);
        setIsAdmin(adminFlag === 'true');
      }
      setLoading(false); // Controllo finito!
    };
    
    checkLogin();
  }, []);

  const login = (token, adminStatus) => {
    setIsAuthenticated(true);
    setIsAdmin(adminStatus);
    localStorage.setItem('authToken', token);
    localStorage.setItem('isAdmin', adminStatus);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.clear();
  };

  // Se stiamo ancora controllando, mostriamo una schermata di caricamento vuota (o uno spinner)
  // Questo impedisce al Router di reindirizzare erroneamente alla Home
  if (loading) {
    return <div style={{display:'flex',justifyContent:'center',marginTop:'50px'}}>Caricamento...</div>; 
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);