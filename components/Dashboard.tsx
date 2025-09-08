
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

const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { 
  style: 'currency', 
  currency: 'USD', 
  minimumFractionDigits: 2,
  maximumFractionDigits: 6 
}).format(value);
const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-compact">
        <p className="form-label font-bold">{label}</p>
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
    totalPLPercentage,
    salesSummary
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
      <div className="summary-cards">
        <div className="summary-card">
          <h3 className="summary-card-title">Valor de Cartera</h3>
          <p className="summary-card-value">{formatCurrency(totalValue)}</p>
        </div>
        <div className="summary-card">
          <h3 className="summary-card-title">Coste Total</h3>
          <p className="summary-card-value">{formatCurrency(totalCost)}</p>
        </div>
        <div className="summary-card">
          <h3 className="summary-card-title">G/P Total</h3>
          <p className={`summary-card-value ${totalPL >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(totalPL)}</p>
        </div>
        <div className="summary-card">
          <h3 className="summary-card-title">Rentabilidad</h3>
          <p className={`summary-card-value ${totalPLPercentage >= 0 ? 'positive' : 'negative'}`}>{formatPercentage(totalPLPercentage)}</p>
        </div>
      </div>
      
      {/* Sales Summary */}
      {salesSummary.salesCount > 0 && (
        <div className="summary-cards">
          <div className="summary-card">
            <h3 className="summary-card-title">Ventas Realizadas</h3>
            <p className="summary-card-value">{salesSummary.salesCount}</p>
          </div>
          <div className="summary-card">
            <h3 className="summary-card-title">Dinero de Ventas</h3>
            <p className="summary-card-value">{formatCurrency(salesSummary.totalSalesValue)}</p>
          </div>
          <div className="summary-card">
            <h3 className="summary-card-title">Acciones Vendidas</h3>
            <p className="summary-card-value">{salesSummary.totalSalesQuantity}</p>
          </div>
          <div className="summary-card">
            <h3 className="summary-card-title">Comisiones Ventas</h3>
            <p className="summary-card-value">{formatCurrency(salesSummary.totalSalesCommissions)}</p>
          </div>
        </div>
      )}
      
      {/* Charts */}
       <div className="grid xl-grid-cols-2">
        <div className="chart-container">
          <h3 className="chart-title">Evolución de la Cartera</h3>
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
        <div className="chart-container">
            <h3 className="chart-title">Distribución de la Cartera</h3>
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
      <div className="table-container">
        <h3 className="section-title">Resumen por Acción</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                {['Ticker', 'Cantidad', 'Precio Medio', 'Coste Total', 'Precio Actual', 'Valor Actual', 'Ganancia Total', 'Ganancia Media / Acción', 'Ganancia tras Impuestos (19%)', 'Rentabilidad (%)'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaries.map(s => (
                <tr key={s.ticker}>
                  <td className="ticker-cell">{s.ticker}</td>
                  <td>{s.totalQuantity}</td>
                  <td>{formatCurrency(s.weightedAveragePrice)}</td>
                  <td>{formatCurrency(s.totalCost)}</td>
                  <td>{formatCurrency(s.currentPrice)}</td>
                  <td>{formatCurrency(s.currentValue)}</td>
                  <td className={s.totalPL >= 0 ? 'positive' : 'negative'}>{formatCurrency(s.totalPL)}</td>
                  <td className={s.averagePL >= 0 ? 'positive' : 'negative'}>{formatCurrency(s.averagePL)}</td>
                  <td className={s.plAfterTax >= 0 ? 'positive' : 'negative'}>{formatCurrency(s.plAfterTax)}</td>
                  <td className={s.totalPLPercentage >= 0 ? 'positive' : 'negative'}>{formatPercentage(s.totalPLPercentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Detailed Table */}
      <div className="table-container">
        <h3 className="section-title">Detalle de Compras</h3>
        {/* Filters */}
        <div className="filter-controls">
          <select value={tickerFilter} onChange={e => setTickerFilter(e.target.value)} className="filter-select">
            <option value="all">Todos los Tickers</option>
            {uniqueTickers.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="filter-input"/>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="filter-input"/>
          <button onClick={() => { setTickerFilter('all'); setStartDate(''); setEndDate(''); }} className="btn btn-secondary">Limpiar</button>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                {['Fecha', 'Ticker', 'Cantidad', 'Precio', 'Comisión', 'Coste Total', 'G/P por Operación', 'Acciones'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td className="ticker-cell">{t.ticker}</td>
                  <td className={t.quantity < 0 ? 'negative' : ''}>{t.quantity}</td>
                  <td>{formatCurrency(t.price)}</td>
                  <td>{formatCurrency(t.commission || 0)}</td>
                  <td>{formatCurrency(Math.abs(t.quantity) * t.price + (t.commission || 0))}</td>
                  <td className={t.pl >= 0 ? 'positive' : 'negative'}>{formatCurrency(t.pl)}</td>
                  <td>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setEditingTransaction(t)} className="btn btn-ghost text-sm">Editar</button>
                      <button onClick={() => onDeleteTransaction(t.id)} className="btn btn-ghost text-sm">Eliminar</button>
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