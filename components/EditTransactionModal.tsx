
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
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-base-200 p-8 rounded-lg shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-400">Editar Transacción</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-date" className="block text-sm font-medium text-gray-300">Fecha</label>
            <input
              type="date"
              id="edit-date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full bg-base-300 border border-base-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-ticker" className="block text-sm font-medium text-gray-300">Ticker/Acción</label>
            <input
              type="text"
              id="edit-ticker"
              name="ticker"
              placeholder="Ej. AAPL"
              value={formData.ticker}
              onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
              className="mt-1 block w-full bg-base-300 border border-base-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-300">Cantidad</label>
              <input
                type="number"
                id="edit-quantity"
                name="quantity"
                placeholder="0"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                step="any"
                className="mt-1 block w-full bg-base-300 border border-base-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-price" className="block text-sm font-medium text-gray-300">Precio/Acción</label>
              <input
                type="number"
                id="edit-price"
                name="price"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="any"
                className="mt-1 block w-full bg-base-300 border border-base-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm text-white"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
             <button type="button" onClick={onClose} className="bg-base-300 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                Cancelar
             </button>
            <button type="submit" className="bg-secondary hover:bg-accent text-white font-bold py-2 px-4 rounded-md transition duration-300">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default EditTransactionModal;
