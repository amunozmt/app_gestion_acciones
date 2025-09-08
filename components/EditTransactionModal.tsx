
import React, { useState } from 'react';
import { Transaction } from '../types';

interface EditTransactionModalProps {
  transaction: Transaction;
  onSave: (transaction: Transaction) => void;
  onClose: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, onSave, onClose }) => {
  const [formData, setFormData] = useState<Transaction>(transaction);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div 
      className="modal-overlay"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Editar Transacción</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="edit-date" className="form-label">Fecha</label>
            <input
              type="date"
              id="edit-date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-ticker" className="form-label">Ticker/Acción</label>
            <input
              type="text"
              id="edit-ticker"
              name="ticker"
              placeholder="Ej. AAPL"
              value={formData.ticker}
              onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
              className="form-input"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-quantity" className="form-label">Cantidad</label>
              <input
                type="number"
                id="edit-quantity"
                name="quantity"
                placeholder="0"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                step="any"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-price" className="form-label">Precio/Acción</label>
              <input
                type="number"
                id="edit-price"
                name="price"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="any"
                className="form-input"
                required
              />
            </div>
          </div>
          <div className="modal-actions">
             <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancelar
             </button>
            <button type="submit" className="btn btn-primary">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
