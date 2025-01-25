import { useState, useEffect } from "react";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { TokenPrice, SwapFormData } from "../types";
import { fetchTokenPrices } from "../services/api";
import TokenSelect from "./TokenSelect";
import Notification from "./Notification";

export default function SwapForm() {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SwapFormData>({
    fromToken: "",
    toToken: "",
    amount: "",
  });
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<string>("");
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const data = await fetchTokenPrices();
        setPrices(data);
      } catch (error) {
        console.error("Failed to load prices:", error);
      }
    };
    loadPrices();
  }, []);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromToken || !formData.toToken || !formData.amount) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setNotification({
        show: true,
        message: `Successfully swapped ${formData.amount} ${formData.fromToken} to ${calculatedAmount} ${formData.toToken}`,
        type: "success",
      });
      // Reset form
      setFormData({
        fromToken: "",
        toToken: "",
        amount: "",
      });
      setCalculatedAmount("");
      setExchangeRate(null);
    } catch (error) {
      setNotification({
        show: true,
        message: `Failed to complete the swap. Please try again. ${error}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwapTokens = () => {
    setFormData((prev) => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
    }));
  };

  const calculateExchangeRate = () => {
    const fromPrice =
      prices.find((p) => p.currency === formData.fromToken)?.price || 0;
    const toPrice =
      prices.find((p) => p.currency === formData.toToken)?.price || 0;
    if (fromPrice && toPrice) {
      setExchangeRate(toPrice / fromPrice);
      if (formData.amount) {
        const calculated = (
          parseFloat(formData.amount) *
          (toPrice / fromPrice)
        ).toFixed(6);
        setCalculatedAmount(calculated);
      }
    }
  };

  useEffect(() => {
    if (formData.fromToken && formData.toToken) {
      calculateExchangeRate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.fromToken, formData.toToken, formData.amount, prices]);

  const availableTokens = prices.map((p) => p.currency).sort();

  return (
    <>
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      <div className="swap-form">
        <h2>Swap Tokens</h2>

        <form onSubmit={handleSwap}>
          <div className="form-group">
            <label className="form-label">From</label>
            <div className="input-pair">
              <TokenSelect
                value={formData.fromToken}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, fromToken: value }))
                }
                tokens={availableTokens}
              />
              <input
                type="number"
                className="form-control amount-input"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                required
                min="0"
                step="any"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSwapTokens}
            className="swap-button"
          >
            <ArrowsUpDownIcon />
          </button>

          <div className="form-group">
            <label className="form-label">To</label>
            <div className="input-pair">
              <TokenSelect
                value={formData.toToken}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, toToken: value }))
                }
                tokens={availableTokens}
              />
              {calculatedAmount && (
                <input
                  type="text"
                  className="form-control amount-input"
                  value={calculatedAmount}
                  disabled
                  placeholder="0.00"
                />
              )}
            </div>
          </div>

          {exchangeRate && (
            <div className="exchange-rate">
              <p>
                Exchange Rate: 1 {formData.fromToken} ={" "}
                {exchangeRate.toFixed(6)} {formData.toToken}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={
              loading ||
              !formData.fromToken ||
              !formData.toToken ||
              !formData.amount
            }
          >
            {loading ? "Processing..." : "Swap Tokens"}
          </button>
        </form>
      </div>
    </>
  );
}
