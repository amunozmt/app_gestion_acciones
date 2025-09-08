
import React, { useState, useMemo } from 'react';
import { Transaction } from './types';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import Dashboard from './components/Dashboard';
import ConfirmationModal from './components/ConfirmationModal';

const initialTransactions: Transaction[] = [
  { id: '1', date: '2023-01-15', ticker: 'AAPL', quantity: 10, price: 150.00 },
  { id: '2', date: '2023-03-22', ticker: 'GOOGL', quantity: 5, price: 105.50 },
  { id: '3', date: '2023-06-05', ticker: 'AAPL', quantity: 5, price: 175.25 },
  { id: '4', date: '2023-08-10', ticker: 'MSFT', quantity: 8, price: 320.00 },
  { id: '5', date: '2024-01-20', ticker: 'GOOGL', quantity: 3, price: 140.75 },
];

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({
    'AAPL': 190.50,
    'GOOGL': 155.20,
    'MSFT': 370.80,
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
    <div className="min-h-screen bg-base-100 text-neutral p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1">
            <ControlPanel
              onAddTransaction={addTransaction}
              onImportTransactions={importTransactions}
              transactions={transactions}
              uniqueTickers={uniqueTickers}
              currentPrices={currentPrices}
              onUpdatePrice={updateCurrentPrice}
            />
          </div>
          <div className="lg:col-span-2">
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
          <div className="mt-4 p-3 bg-base-300 rounded-md text-sm">
            <p><span className="font-bold">Fecha:</span> {transactionToDelete.date}</p>
            <p><span className="font-bold">Ticker:</span> {transactionToDelete.ticker}</p>
            <p><span className="font-bold">Cantidad:</span> {transactionToDelete.quantity}</p>
            <p><span className="font-bold">Precio:</span> {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(transactionToDelete.price)}</p>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default App;
