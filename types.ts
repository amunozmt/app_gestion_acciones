
export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  ticker: string;
  quantity: number; // Can be negative for sales
  price: number;
  commission?: number; // Optional commission fee
}

export interface StockSummary {
  ticker: string;
  totalQuantity: number;
  weightedAveragePrice: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  totalPL: number;
  totalPLPercentage: number;
  averagePL: number;
  plAfterTax: number;
}

export interface TransactionWithPL extends Transaction {
  currentPrice: number;
  currentValue: number;
  pl: number;
}

export interface PortfolioHistoryPoint {
  date: string;
  totalValue: number;
  totalCost: number;
}