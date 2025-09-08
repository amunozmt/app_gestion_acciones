
import { useMemo } from 'react';
import { Transaction, StockSummary, TransactionWithPL, PortfolioHistoryPoint } from '../types';

export const usePortfolioCalculations = (transactions: Transaction[], currentPrices: Record<string, number>) => {
  const uniqueTickers = useMemo(() => {
    const tickers = new Set(transactions.map(t => t.ticker));
    return Array.from(tickers);
  }, [transactions]);
  
  const summaries = useMemo<StockSummary[]>(() => {
    return uniqueTickers.map(ticker => {
      const tickerTransactions = transactions.filter(t => t.ticker === ticker);
      const totalQuantity = tickerTransactions.reduce((sum, t) => sum + t.quantity, 0);
      const totalCost = tickerTransactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);
      const weightedAveragePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
      const currentPrice = currentPrices[ticker] || 0;
      const currentValue = totalQuantity * currentPrice;
      const totalPL = currentValue - totalCost;
      const totalPLPercentage = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

      return {
        ticker,
        totalQuantity,
        weightedAveragePrice,
        totalCost,
        currentPrice,
        currentValue,
        totalPL,
        totalPLPercentage,
      };
    });
  }, [transactions, currentPrices, uniqueTickers]);

  const transactionsWithPL = useMemo<TransactionWithPL[]>(() => {
    return transactions.map(t => {
      const currentPrice = currentPrices[t.ticker] || 0;
      const currentValue = t.quantity * currentPrice;
      const cost = t.quantity * t.price;
      const pl = currentValue - cost;
      
      return {
        ...t,
        currentPrice,
        currentValue,
        pl,
      };
    });
  }, [transactions, currentPrices]);
  
  const portfolioHistory = useMemo<PortfolioHistoryPoint[]>(() => {
    if (transactions.length === 0) return [];

    const sortedTransactions = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const history: PortfolioHistoryPoint[] = [];
    const portfolio: { [key: string]: { quantity: number, cost: number }} = {};

    for (const t of sortedTransactions) {
        if (!portfolio[t.ticker]) {
            portfolio[t.ticker] = { quantity: 0, cost: 0 };
        }
        portfolio[t.ticker].quantity += t.quantity;
        portfolio[t.ticker].cost += t.quantity * t.price;

        let totalValue = 0;
        let totalCost = 0;
        for (const ticker in portfolio) {
            totalCost += portfolio[ticker].cost;
            totalValue += portfolio[ticker].quantity * (currentPrices[ticker] || 0);
        }

        history.push({
            date: t.date,
            totalValue,
            totalCost,
        });
    }

    // Deduplicate dates, keeping the last entry for each day
    const uniqueDateHistory = Array.from(new Map(history.map(item => [item.date, item])).values());

    return uniqueDateHistory;
  }, [transactions, currentPrices]);

  const totals = useMemo(() => {
    return summaries.reduce((acc, summary) => {
        acc.totalCost += summary.totalCost;
        acc.totalValue += summary.currentValue;
        return acc;
    }, { totalCost: 0, totalValue: 0 });
  }, [summaries]);

  const totalPL = totals.totalValue - totals.totalCost;
  const totalPLPercentage = totals.totalCost > 0 ? (totalPL / totals.totalCost) * 100 : 0;

  return { 
    summaries, 
    transactionsWithPL, 
    portfolioHistory,
    totalCost: totals.totalCost,
    totalValue: totals.totalValue,
    totalPL,
    totalPLPercentage
  };
};
