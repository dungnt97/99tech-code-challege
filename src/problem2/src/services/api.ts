import axios from "axios";
import { TokenPrice } from "../types";

const API_URL = "https://interview.switcheo.com/prices.json";

export const fetchTokenPrices = async (): Promise<TokenPrice[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    throw error;
  }
};
