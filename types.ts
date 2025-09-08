
export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  ticker: string;
  quantity: number;
  price: number;
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