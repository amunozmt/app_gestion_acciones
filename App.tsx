
import React, { useState, useMemo } from 'react';
import { Transaction } from './types';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import Dashboard from './components/Dashboard';
import ConfirmationModal from './components/ConfirmationModal';
import { useLocalStorage } from './hooks/useLocalStorage';

const initialTransactions: Transaction[] = [
  { id: '1', date: '2025-07-11', ticker: 'ORO', quantity: 0.034021, price: 2909.94, commission: 0 },
  { id: '2', date: '2025-07-14', ticker: 'NVIDIA', quantity: 0.99758162, price: 165.4, commission: 0 },
  { id: '3', date: '2025-08-18', ticker: 'S&P500', quantity: 1.09313511, price: 9.15, commission: 0 },
  { id: '4', date: '2025-08-18', ticker: 'S&P500', quantity: 1.09313511, price: 9.15, commission: 0 },
  { id: '5', date: '2025-08-31', ticker: 'ORO', quantity: 0.066619, price: 2987.13, commission: 0 },
  { id: '6', date: '2025-09-03', ticker: 'S&P500', quantity: 21.85147552, price: 9.15, commission: 0 },
];

const App: React.FC = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('portfolio-transactions', initialTransactions);
  const [currentPrices, setCurrentPrices] = useLocalStorage<Record<string, number>>('portfolio-current-prices', {
    'ORO': 2909.94,
    'NVIDIA': 165.4,
    'S&P500': 9.15,
  });
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const uniqueTickers = useMemo(() => {
    const tickers = new Set(transactions.map(t => t.ticker));
    return Array.from(tickers).sort();
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().getTime().toString(),
    };
    setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };
  
  const importTransactions = (newTransactions: Omit<Transaction, 'id'>[]) => {
    const transactionsWithIds = newTransactions.map((t, index) => ({
      ...t,
      id: `${new Date().getTime()}-${index}`,
    }));
    setTransactions(prev => [...prev, ...transactionsWithIds].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    alert(`${transactionsWithIds.length} transacciones importadas con éxito.`);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev
        .map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  };

  const requestDeleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id) || null;
    setTransactionToDelete(transaction);
  };

  const confirmDeleteTransaction = () => {
    if (transactionToDelete) {
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
      setTransactionToDelete(null);
    }
  };
  
  const cancelDeleteTransaction = () => {
    setTransactionToDelete(null);
  };


  const updateCurrentPrice = (ticker: string, price: number) => {
    setCurrentPrices(prev => ({ ...prev, [ticker]: price }));
  };

  return (
    <div className="app-container">
      <div className="max-width-container">
        <Header />
        <main className="grid lg-grid-cols-3 mt-8">
          <div className="lg-col-span-1">
            <ControlPanel
              onAddTransaction={addTransaction}
              onImportTransactions={importTransactions}
              transactions={transactions}
              uniqueTickers={uniqueTickers}
              currentPrices={currentPrices}
              onUpdatePrice={updateCurrentPrice}
            />
          </div>
          <div className="lg-col-span-2">
            <Dashboard 
              transactions={transactions} 
              currentPrices={currentPrices}
              onUpdateTransaction={updateTransaction}
              onDeleteTransaction={requestDeleteTransaction}
            />
          </div>
        </main>
      </div>
      <ConfirmationModal
        isOpen={!!transactionToDelete}
        onClose={cancelDeleteTransaction}
        onConfirm={confirmDeleteTransaction}
        title="Confirmar Eliminación"
      >
        <p>¿Estás seguro de que quieres eliminar esta transacción?</p>
        {transactionToDelete && (
          <div className="mt-4 p-3 card-compact">
            <p><span className="font-bold">Fecha:</span> {transactionToDelete.date}</p>
            <p><span className="font-bold">Ticker:</span> {transactionToDelete.ticker}</p>
            <p><span className="font-bold">Cantidad:</span> {transactionToDelete.quantity}</p>
            <p><span className="font-bold">Precio:</span> {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(transactionToDelete.price)}</p>
            {transactionToDelete.commission && transactionToDelete.commission > 0 && (
              <p><span className="font-bold">Comisión:</span> {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(transactionToDelete.commission)}</p>
            )}
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default App;
