import { useState, useEffect, useRef } from "react";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const getTokenIconUrl = (symbol: string) =>
  `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;

interface TokenSelectProps {
  value: string;
  onChange: (value: string) => void;
  tokens: string[];
  placeholder?: string;
}

export default function TokenSelect({
  value,
  onChange,
  tokens,
  placeholder,
}: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Loại bỏ token trùng lặp
  const uniqueTokens = [...new Set(tokens)];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredTokens = uniqueTokens.filter((token) => {
    const searchTerm = search.trim().toLowerCase();
    const tokenName = token.toLowerCase();

    if (!searchTerm) return true;

    return tokenName.startsWith(searchTerm);
  });

  const handleOpen = () => {
    setIsOpen(true);
    setSearch("");
  };

  return (
    <div
      className={`select-wrapper ${isOpen ? "is-open" : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="form-control token-select"
        onClick={handleOpen}
      >
        <div className="token-select-content">
          {value ? (
            <>
              <img
                src={getTokenIconUrl(value)}
                alt={value}
                className="token-icon-button"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span>{value}</span>
            </>
          ) : (
            <span className="placeholder">{placeholder || "Select token"}</span>
          )}
        </div>
        <ChevronDownIcon
          className={`token-select-arrow ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="token-dropdown">
          <div className="token-search">
            <MagnifyingGlassIcon className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search token"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="token-list">
            {filteredTokens.map((token) => (
              <button
                key={token}
                type="button"
                className="token-option"
                onClick={() => {
                  onChange(token);
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                <img
                  src={getTokenIconUrl(token)}
                  alt={token}
                  className="token-icon-option"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span>{token}</span>
              </button>
            ))}
            {filteredTokens.length === 0 && (
              <div className="no-results">No tokens found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
