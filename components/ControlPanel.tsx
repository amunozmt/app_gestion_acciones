
import React, { useState, useRef } from 'react';
import { Transaction } from '../types';

interface ControlPanelProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onImportTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  transactions: Transaction[];
  uniqueTickers: string[];
  currentPrices: Record<string, number>;
  onUpdatePrice: (ticker: string, price: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onAddTransaction,
  onImportTransactions,
  transactions,
  uniqueTickers,
  currentPrices,
  onUpdatePrice 
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [ticker, setTicker] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [commission, setCommission] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker && quantity && price) {
      onAddTransaction({
        date,
        ticker: ticker.toUpperCase(),
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        commission: commission ? parseFloat(commission) : 0,
      });
      setTicker('');
      setQuantity('');
      setPrice('');
      setCommission('');
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      alert('No hay transacciones para exportar.');
      return;
    }
    const headers = 'date,ticker,quantity,price';
    const csvContent = transactions
      .map(t => `${t.date},${t.ticker},${t.quantity},${t.price}`)
      .join('\n');
    
    const csvData = `${headers}\n${csvContent}`;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'cartera_acciones.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length <= 1) {
          throw new Error('El archivo CSV está vacío o solo contiene la cabecera.');
        }

        const headerLine = lines[0].trim().toLowerCase().split(',').map(h => h.trim());
        const requiredHeaders = ['date', 'ticker', 'quantity', 'price'];
        const optionalHeaders = ['commission'];
        
        const headerIndices: Record<string, number> = {};
        requiredHeaders.forEach(h => {
          const index = headerLine.indexOf(h);
          if (index === -1) throw new Error(`Falta la columna requerida en el CSV: ${h}`);
          headerIndices[h] = index;
        });
        
        // Handle optional headers
        optionalHeaders.forEach(h => {
          const index = headerLine.indexOf(h);
          if (index !== -1) headerIndices[h] = index;
        });

        const importedTransactions: Omit<Transaction, 'id'>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].trim().split(',');
          if (values.length !== headerLine.length) {
            console.warn(`Saltando línea ${i+1}: número incorrecto de columnas.`);
            continue;
          }

          const date = values[headerIndices.date].trim();
          const ticker = values[headerIndices.ticker].trim().toUpperCase();
          const quantity = parseFloat(values[headerIndices.quantity]);
          const price = parseFloat(values[headerIndices.price]);
          const commission = headerIndices.commission !== undefined ? parseFloat(values[headerIndices.commission]) || 0 : 0;

          if (!date || !ticker || isNaN(quantity) || isNaN(price) || quantity === 0 || price < 0) {
             console.warn(`Saltando línea ${i+1}: datos inválidos.`);
             continue;
          }
          
          importedTransactions.push({ date, ticker, quantity, price, commission });
        }
        
        if (importedTransactions.length > 0) {
            onImportTransactions(importedTransactions);
        } else {
            alert('No se encontraron transacciones válidas para importar.');
        }

      } catch (error) {
        alert(`Error al procesar el archivo: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        if(event.target) event.target.value = '';
      }
    };
    
    reader.onerror = () => {
        alert('Error al leer el archivo.');
        if(event.target) event.target.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <div className="control-panel">
      <div className="card">
        <h2 className="section-title">Registrar Transacción</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="date" className="form-label">Fecha</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="ticker" className="form-label">Ticker/Acción</label>
            <input
              type="text"
              id="ticker"
              placeholder="Ej. AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="form-input"
              required
              list="ticker-suggestions"
            />
            <datalist id="ticker-suggestions">
              {uniqueTickers.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity" className="form-label">Cantidad</label>
              <input
                type="number"
                id="quantity"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="0.000001"
                className="form-input"
                required
              />
              <small className="text-xs text-gray-500">Positivo: compra, Negativo: venta</small>
            </div>
            <div className="form-group">
              <label htmlFor="price" className="form-label">Precio/Acción</label>
              <input
                type="number"
                id="price"
                placeholder="0.000000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.000001"
                className="form-input"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="commission" className="form-label">Comisión (opcional)</label>
            <input
              type="number"
              id="commission"
              placeholder="0.00"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              min="0"
              step="0.01"
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Añadir Transacción
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="section-title">Datos</h2>
        <div className="btn-group">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              className="hidden"
              accept=".csv"
            />
            <button onClick={handleImportClick} className="btn btn-primary btn-full">
                Importar CSV
            </button>
            <button onClick={handleExport} className="btn btn-secondary btn-full">
                Exportar CSV
            </button>
        </div>
        <p className="text-xs mt-3">
          El CSV debe tener las columnas: <code>date,ticker,quantity,price</code> (commission es opcional)
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Precios Actuales</h2>
        <div className="space-y-3">
          {uniqueTickers.length > 0 ? uniqueTickers.map(ticker => (
            <div key={ticker} className="price-input-group">
              <label htmlFor={`price-${ticker}`} className="price-input-label">{ticker}</label>
              <div className="price-input-wrapper">
                <span className="price-input-symbol">$</span>
                <input
                  type="number"
                  id={`price-${ticker}`}
                  value={currentPrices[ticker] || ''}
                  onChange={(e) => onUpdatePrice(ticker, parseFloat(e.target.value) || 0)}
                  className="price-input"
                  placeholder="0.00"
                  min="0"
                  step="any"
                />
              </div>
            </div>
          )) : <p className="text-sm">Añade una transacción para ver tickers aquí.</p>}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
