
import React, { useState, useMemo } from 'react';
import { Transaction, StockSummary, TransactionWithPL } from '../types';
import { usePortfolioCalculations } from '../hooks/usePortfolioCalculations';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import EditTransactionModal from './EditTransactionModal';

interface DashboardProps {
  transactions: Transaction[];
  currentPrices: Record<string, number>;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#f59e0b'];

const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(value);
const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-base-300 border border-base-100 rounded-md shadow-lg">
        <p className="label font-bold">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {`${p.name}: ${formatCurrency(p.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ transactions, currentPrices, onUpdateTransaction, onDeleteTransaction }) => {
  const { 
    summaries, 
    transactionsWithPL, 
    portfolioHistory,
    totalCost,
    totalValue,
    totalPL,
    totalPLPercentage 
  } = usePortfolioCalculations(transactions, currentPrices);
  
  const [tickerFilter, setTickerFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithPL | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactionsWithPL.filter(t => {
      const date = new Date(t.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const tickerMatch = tickerFilter === 'all' || t.ticker === tickerFilter;
      const dateMatch = (!start || date >= start) && (!end || date <= end);
      return tickerMatch && dateMatch;
    });
  }, [transactionsWithPL, tickerFilter, startDate, endDate]);

  const uniqueTickers = useMemo(() => Array.from(new Set(transactions.map(t => t.ticker))), [transactions]);

  const portfolioDistributionData = useMemo(() => summaries.map(s => ({ name: s.ticker, value: s.currentValue })), [summaries]);
  const profitDistributionData = useMemo(() => summaries.map(s => ({ name: s.ticker, value: s.totalPL })), [summaries]);

  const handleSaveTransaction = (updatedTransaction: Transaction) => {
    onUpdateTransaction(updatedTransaction);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-base-200 p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-400">Valor de Cartera</h3>
          <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-base-200 p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-400">Coste Total</h3>
          <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(totalCost)}</p>
        </div>
        <div className="bg-base-200 p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-400">G/P Total</h3>
          <p className={`mt-1 text-2xl font-semibold ${totalPL >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(totalPL)}</p>
        </div>
        <div className="bg-base-200 p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-400">Rentabilidad</h3>
          <p className={`mt-1 text-2xl font-semibold ${totalPLPercentage >= 0 ? 'text-success' : 'text-danger'}`}>{formatPercentage(totalPLPercentage)}</p>
        </div>
      </div>
      
      {/* Charts */}
       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-base-200 p-4 rounded-lg shadow-lg h-96">
          <h3 className="font-bold text-lg mb-4 text-blue-400">Evolución de la Cartera</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolioHistory} margin={{ top: 5, right: 20, left: 35, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="totalValue" name="Valor Actual" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="totalCost" name="Coste Total" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-base-200 p-4 rounded-lg shadow-lg h-96">
            <h3 className="font-bold text-lg mb-4 text-blue-400">Distribución de la Cartera</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={portfolioDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {portfolioDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
       </div>

      {/* Summary Table */}
      <div className="bg-base-200 p-6 rounded-lg shadow-lg">
        <h3 className="font-bold text-xl mb-4 text-blue-400">Resumen por Acción</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-300">
              <tr>
                {['Ticker', 'Cantidad', 'Precio Medio', 'Coste Total', 'Precio Actual', 'Valor Actual', 'G/P', 'Rentabilidad (%)'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-base-200 divide-y divide-base-300">
              {summaries.map(s => (
                <tr key={s.ticker} className="hover:bg-base-300">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{s.ticker}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{s.totalQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(s.weightedAveragePrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(s.totalCost)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(s.currentPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(s.currentValue)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${s.totalPL >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(s.totalPL)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${s.totalPLPercentage >= 0 ? 'text-success' : 'text-danger'}`}>{formatPercentage(s.totalPLPercentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Detailed Table */}
      <div className="bg-base-200 p-6 rounded-lg shadow-lg">
        <h3 className="font-bold text-xl mb-4 text-blue-400">Detalle de Compras</h3>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select value={tickerFilter} onChange={e => setTickerFilter(e.target.value)} className="bg-base-300 border border-base-100 rounded-md py-2 px-3 focus:outline-none">
            <option value="all">Todos los Tickers</option>
            {uniqueTickers.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-base-300 border border-base-100 rounded-md py-2 px-3"/>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-base-300 border border-base-100 rounded-md py-2 px-3"/>
          <button onClick={() => { setTickerFilter('all'); setStartDate(''); setEndDate(''); }} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Limpiar</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-300">
              <tr>
                {['Fecha', 'Ticker', 'Cantidad', 'Precio Compra', 'Coste', 'G/P por Operación', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-base-200 divide-y divide-base-300">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-base-300">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{t.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{t.ticker}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{t.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(t.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(t.quantity * t.price)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${t.pl >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(t.pl)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setEditingTransaction(t)} className="text-accent hover:text-blue-400 transition duration-150">Editar</button>
                      <button onClick={() => onDeleteTransaction(t.id)} className="text-danger hover:text-red-400 transition duration-150">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onSave={handleSaveTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}

    </div>
  );
};

export default Dashboard;
