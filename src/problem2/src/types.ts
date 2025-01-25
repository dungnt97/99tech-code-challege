export interface Token {
  symbol: string;
  name: string;
  price: number;
}

export interface SwapFormData {
  fromToken: string;
  toToken: string;
  amount: string;
}

export interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}
