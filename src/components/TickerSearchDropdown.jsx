import { useRef, useState, useEffect } from "react";

/**
 * @typedef {{
 *  symbol: string,
 *  shortname: string | null,
 *  exchange: string | null,
 *  quoteType: string | null,
 *  longname: string | null,
 *  index: string | null,
 *  score: number | null,
 *  typeDisp: string | null,
 *  exchDisp: string | null,
 *  isYahooFinance: boolean | null
 * }} TickerSearchReference
 */

const API_BASE = import.meta.env.VITE_API_URL;

function TickerSearchDropdown({
  onSelect,
  ticker,
  queryBecomesTicker = false,
  label = "Search Ticker",
}) {
  // Search dropdown states
  const [searchQuery, setSearchQuery] = useState("");
  /** @type {[TickerSearchReference[], React.Dispatch<React.SetStateAction<TickerSearchReference[]>>]} */
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sync searchQuery with ticker when changed by parent
  useEffect(() => {
    if (queryBecomesTicker) {
      setSearchQuery(ticker);
    }
  }, [ticker, queryBecomesTicker]);

  // Search functionality
  const searchTickers = async (query) => {
    setIsSearching(true);

    try {
      const response = await fetch(
        `${API_BASE}/search_ticker?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        /** @type {TickerSearchReference[]} */
        const results = await response.json();

        setSearchResults(results);
        setShowDropdown(true); // Always show dropdown for both results and "no results"
        setSelectedIndex(results.length > 0 ? 0 : -1);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFocus = () => {
    if (searchResults.length > 0) {
      setShowDropdown(true);
      setSelectedIndex(
        searchResults.findIndex((item) => item.symbol === ticker)
      );
    } else {
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(!showDropdown);
      setSelectedIndex(showDropdown ? 0 : -1);
    } else if (e.key === "Tab") {
      if (showDropdown) {
        setShowDropdown(false);
      }
    } else if (
      e.key === "ArrowDown" &&
      selectedIndex < searchResults.length - 1
    ) {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp" && selectedIndex > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selection = searchResults[selectedIndex];
      onSelect(selection);
      setShowDropdown(false);
      if (queryBecomesTicker) {
        setSearchQuery(selection.symbol);
      }
    }
  };

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (searchValue) => {
    setSearchQuery(searchValue);

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    if (searchValue.trim())
      debounceRef.current = setTimeout(() => {
        searchTickers(searchValue);
      }, 500);
  };

  useEffect(() => {
    // Auto remove selected index if dropdown is closed
    if (!showDropdown) {
      setSelectedIndex(-1);
    }
  }, [showDropdown]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        htmlFor="ticker-search"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id="ticker-search"
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={() => handleFocus()}
        onKeyDown={(e) => {
          handleKeyDown(e);
        }}
        placeholder="Search for ticker (e.g., Apple, AAPL)"
        className="border px-3 py-2 rounded w-full"
        autoComplete="off"
      />

      {/* Loading indicator for search */}
      {isSearching && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* No results message - styled like dropdown */}
      {showDropdown && searchResults.length === 0 && !isSearching && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="px-3 py-2 text-gray-500 text-center">
            No results found
          </div>
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {searchResults.map((searchItem, index) => (
            <div
              key={`${searchItem.symbol}${searchItem.exchDisp}${searchItem.typeDisp}`}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                index === selectedIndex ? "bg-blue-100" : ""
              }`}
              onClick={() => {
                onSelect(searchItem);
                setShowDropdown(false);
                if (queryBecomesTicker) {
                  setSearchQuery(searchItem.symbol);
                }
              }}
            >
              <div className="font-medium">{searchItem.symbol}</div>
              <div className="text-sm text-gray-600 truncate">
                {searchItem.shortname}
              </div>
              <div className="text-xs text-gray-500">
                {searchItem.typeDisp} - {searchItem.exchDisp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TickerSearchDropdown;
