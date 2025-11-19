import React from 'react';
import '../styles/Modal.css';
import { useTranslation } from '../context/LanguageContext';

// Aggiunte props: confirmText e confirmVariant
function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children,
  confirmText, // useTranslation fallback inside
  confirmVariant = "primary" // 'primary' (blu) o 'danger' (rosso)
}) {
  const t = useTranslation();
  const confirmLabel = confirmText || t('common.confirm');
  if (!isOpen) {
    return null;
  }

  // Scegli la classe del bottone in base alla variante
  const buttonClass = confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>{children}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary modal-btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          {/* Bottone dinamico */}
          <button className={`${buttonClass} modal-btn`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;