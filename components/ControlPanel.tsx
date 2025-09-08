
import React, { useState } from 'react';
import { Transaction } from '../types';

interface ControlPanelProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  uniqueTickers: string[];
  currentPrices: Record<string, number>;
  onUpdatePrice: (ticker: string, price: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onAddTransaction, 
  uniqueTickers,
  currentPrices,
  onUpdatePrice 
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [ticker, setTicker] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker && quantity && price) {
      onAddTransaction({
        date,
        ticker: ticker.toUpperCase(),
        quantity: parseFloat(quantity),
        price: parseFloat(price),
      });
      setTicker('');
      setQuantity('');
      setPrice('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-base-200 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Registrar Compra</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300">Fecha</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full bg-base-300 border border-base-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="ticker" className="block text-sm font-medium text-gray-300">Ticker/Acción</label>
            <input
              type="text"
              id="ticker"
              placeholder="Ej. AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="mt-1 block w-full bg-base-300 border border-base-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Cantidad</label>
              <input
                type="number"
                id="quantity"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="any"
                className="mt-1 block w-full bg-base-300 border border-base-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300">Precio/Acción</label>
              <input
                type="number"
                id="price"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="any"
                className="mt-1 block w-full bg-base-300 border border-base-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm text-white"
                required
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-secondary hover:bg-accent text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Añadir Transacción
          </button>
        </form>
      </div>

      <div className="bg-base-200 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Precios Actuales</h2>
        <div className="space-y-3">
          {uniqueTickers.length > 0 ? uniqueTickers.map(ticker => (
            <div key={ticker} className="flex items-center justify-between gap-4">
              <label htmlFor={`price-${ticker}`} className="font-bold text-lg">{ticker}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
                <input
                  type="number"
                  id={`price-${ticker}`}
                  value={currentPrices[ticker] || ''}
                  onChange={(e) => onUpdatePrice(ticker, parseFloat(e.target.value) || 0)}
                  className="block w-32 bg-base-300 border border-base-100 rounded-md shadow-sm py-2 px-3 pl-7 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm text-white"
                  placeholder="0.00"
                  min="0"
                  step="any"
                />
              </div>
            </div>
          )) : <p className="text-gray-400">Añade una transacción para ver tickers aquí.</p>}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
