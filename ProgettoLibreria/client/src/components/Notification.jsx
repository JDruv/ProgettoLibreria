import React, { useEffect, useState } from 'react';
import '../styles/Notification.css';

function Notification({ message, type, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Diamo tempo all'animazione di uscita prima di "distruggere"
        setTimeout(onClose, 300); 
      }, 3000); // Notifica visibile per 3 secondi

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`notification ${type} ${visible ? 'visible' : ''}`}>
      {message}
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
}

export default Notification;