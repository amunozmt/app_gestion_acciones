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
      
      // Calculate weighted average price only for buys (positive quantities)
      const buyTransactions = tickerTransactions.filter(t => t.quantity > 0);
      const totalBuyCost = buyTransactions.reduce((sum, t) => sum + (t.quantity * t.price) + (t.commission || 0), 0);
      const totalBuyQuantity = buyTransactions.reduce((sum, t) => sum + t.quantity, 0);
      const weightedAveragePrice = totalBuyQuantity > 0 ? totalBuyCost / totalBuyQuantity : 0;
      
      // Calculate total cost including commissions
      const totalCost = tickerTransactions.reduce((sum, t) => {
        const transactionCost = Math.abs(t.quantity) * t.price + (t.commission || 0);
        return sum + (t.quantity > 0 ? transactionCost : 0); // Only count buys for total cost
      }, 0);
      
      const currentPrice = currentPrices[ticker] || 0;
      const currentValue = Math.max(0, totalQuantity) * currentPrice; // Only positive holdings have value
      const totalPL = currentValue - totalCost;
      const totalPLPercentage = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
      const averagePL = totalQuantity > 0 ? currentPrice - weightedAveragePrice : 0;
      const plAfterTax = totalPL > 0 ? totalPL * 0.81 : totalPL; // 19% tax on profits

      return {
        ticker,
        totalQuantity,
        weightedAveragePrice,
        totalCost,
        currentPrice,
        currentValue,
        totalPL,
        totalPLPercentage,
        averagePL,
        plAfterTax,
      };
    });
  }, [transactions, currentPrices, uniqueTickers]);

  const transactionsWithPL = useMemo<TransactionWithPL[]>(() => {
    return transactions.map(t => {
      const currentPrice = currentPrices[t.ticker] || 0;
      const currentValue = Math.abs(t.quantity) * currentPrice;
      const cost = Math.abs(t.quantity) * t.price + (t.commission || 0);
      const pl = t.quantity > 0 ? currentValue - cost : cost - currentValue; // For sales, profit is sale price minus original cost
      
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
        const transactionCost = Math.abs(t.quantity) * t.price + (t.commission || 0);
        if (t.quantity > 0) {
          portfolio[t.ticker].cost += transactionCost;
        } else {
          // For sales, reduce cost proportionally
          const saleRatio = Math.abs(t.quantity) / (portfolio[t.ticker].quantity + Math.abs(t.quantity));
          portfolio[t.ticker].cost = Math.max(0, portfolio[t.ticker].cost * (1 - saleRatio));
        }

        let totalValue = 0;
        let totalCost = 0;
        for (const ticker in portfolio) {
            totalCost += portfolio[ticker].cost;
            totalValue += Math.max(0, portfolio[ticker].quantity) * (currentPrices[ticker] || 0);
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

  // Calculate realized gains from sales
  const realizedGains = useMemo(() => {
    let totalRealizedPL = 0;
    const tickerData: Record<string, { remainingShares: number; totalCost: number; }> = {};

    // Sort transactions by date to process them chronologically
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const transaction of sortedTransactions) {
      const { ticker, quantity, price, commission = 0 } = transaction;
      
      if (!tickerData[ticker]) {
        tickerData[ticker] = { remainingShares: 0, totalCost: 0 };
      }

      if (quantity > 0) {
        // Buy transaction
        tickerData[ticker].remainingShares += quantity;
        tickerData[ticker].totalCost += (quantity * price) + commission;
      } else {
        // Sale transaction
        const saleQuantity = Math.abs(quantity);
        const saleValue = (saleQuantity * price) - commission;
        
        if (tickerData[ticker].remainingShares > 0) {
          // Calculate average cost per share for the remaining shares
          const avgCostPerShare = tickerData[ticker].totalCost / tickerData[ticker].remainingShares;
          
          // Calculate how many shares we can sell (minimum of what we want to sell and what we have)
          const sharesToSell = Math.min(saleQuantity, tickerData[ticker].remainingShares);
          
          // Calculate cost basis for the sold shares
          const costBasisForSale = sharesToSell * avgCostPerShare;
          
          // Calculate realized P&L for this sale
          const realizedPLForSale = (sharesToSell * price) - commission - costBasisForSale;
          totalRealizedPL += realizedPLForSale;
          
          // Update remaining shares and cost
          tickerData[ticker].remainingShares -= sharesToSell;
          if (tickerData[ticker].remainingShares > 0) {
            tickerData[ticker].totalCost -= costBasisForSale;
          } else {
            tickerData[ticker].totalCost = 0;
          }
        }
      }
    }

    return totalRealizedPL;
  }, [transactions]);

  const totalPL = totals.totalValue - totals.totalCost + realizedGains;
  const totalPLPercentage = totals.totalCost > 0 ? (totalPL / totals.totalCost) * 100 : 0;

  // Calculate unrealized P&L (current holdings only)
  const unrealizedPL = totals.totalValue - totals.totalCost;

  // Calculate sales summary
  const salesSummary = useMemo(() => {
    const salesTransactions = transactions.filter(t => t.quantity < 0);
    const totalSalesQuantity = salesTransactions.reduce((sum, t) => sum + Math.abs(t.quantity), 0);
    const totalSalesValue = salesTransactions.reduce((sum, t) => sum + (Math.abs(t.quantity) * t.price) - (t.commission || 0), 0);
    const totalSalesCommissions = salesTransactions.reduce((sum, t) => sum + (t.commission || 0), 0);
    
    return {
      totalSalesQuantity,
      totalSalesValue,
      totalSalesCommissions,
      salesCount: salesTransactions.length,
    };
  }, [transactions]);

  return { 
    summaries, 
    transactionsWithPL, 
    portfolioHistory,
    totalCost: totals.totalCost,
    totalValue: totals.totalValue,
    totalPL,
    totalPLPercentage,
    realizedGains,
    unrealizedPL,
    salesSummary
  };
};