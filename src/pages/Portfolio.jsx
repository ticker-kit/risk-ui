import { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";

import { useAuth } from "../hooks/useAuth";
import PortfolioTable from "../components/PortfolioTable";
import TickerSearchDropdown from "../components/TickerSearchDropdown";

/**
 * @typedef {{
 * ticker: string;
 * quantity: number;
 * symbol: string;
 * currency: string;
 * previousClose: number;
 * bid: number;
 * ask: number;
 * regularMarketPrice: number;
 * quoteType: string;
 * typeDisp: string;
 * longName: string;
 * shortName: string;
 * fullExchangeName: string;
 * legalType: string | null;
 * fundFamily: string | null;
 * }} AssetPositionWithInfo
 */

const API_URL = import.meta.env.VITE_API_URL;

function Portfolio() {
  const { token, handleTokenExpired } = useAuth();

  const notify = (text) => {
    toast(text);
  };

  /** @type {[AssetPositionWithInfo[] | null, React.Dispatch<React.SetStateAction<AssetPositionWithInfo[] | null>>]} */
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for adding new position
  const [newTicker, setNewTicker] = useState("");
  const [tickerError, setTickerError] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [quantityError, setQuantityError] = useState(null);
  const [addingPosition, setAddingPosition] = useState(false);

  // Edit state
  const [editingPosition, setEditingPosition] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch portfolio
  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/portfolio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleTokenExpired(response);
        }
        throw new Error("Failed to fetch portfolio");
      }

      const data = await response.json();

      setPositions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, handleTokenExpired]);

  // Add new position
  const addPosition = async (e) => {
    e.preventDefault();
    if (!newTicker.trim() || !newQuantity) return;

    try {
      setAddingPosition(true);
      setError(null);

      const response = await fetch(`${API_URL}/portfolio`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker: newTicker.trim(),
          quantity: parseFloat(newQuantity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          handleTokenExpired(response);
        }
        throw new Error(errorData.detail || "Failed to add position");
      }

      /** @type {AssetPositionWithInfo} */
      const data = await response.json();

      setPositions((prev) => [...prev, data]);

      setNewTicker("");
      setNewQuantity("");

      notify("Position added successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingPosition(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setNewQuantity("");
      setQuantityError(null);
      return;
    }

    setNewQuantity(value);

    if (isNaN(value) || value <= 0 || value > 1000000) {
      setQuantityError(
        "Quantity must be a positive number between 1 and 1,000,000."
      );
    } else {
      setQuantityError(null);
    }
  };

  // Update position quantity
  const updatePosition = async (symbol, quantity) => {
    try {
      setError(null);
      const response = await fetch(
        `${API_URL}/portfolio/${symbol}?quantity=${quantity}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          handleTokenExpired(response);
        }
        throw new Error(errorData.detail || "Failed to update position");
      }

      /** @type {AssetPositionWithInfo} */
      const data = await response.json();

      setPositions((prev) => prev.map((p) => (p.ticker === symbol ? data : p)));

      setEditingPosition(null);
      notify("Position updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete position
  const deletePosition = async (symbol) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/portfolio/${symbol}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          handleTokenExpired(response);
        }
        throw new Error(errorData.detail || "Failed to delete position");
      }

      setPositions((prev) =>
        prev.filter((position) => position.ticker !== symbol)
      );

      setDeleteConfirm(null);
      notify("Position deleted successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle search result selection
  const selectTicker = (ticker) => {
    if (positions.some((p) => p.ticker === ticker.symbol)) {
      setTickerError(
        `Ticker ${ticker.symbol} is already in your portfolio. Use the edit option to change the quantity.`
      );
      return;
    }

    setNewTicker(ticker.symbol);
    setTickerError(null);
  };

  // Handle edit start
  const startEdit = (position) => {
    setEditingPosition(position.ticker);
    setEditQuantity(position.quantity.toString());
  };

  // Handle edit save
  const saveEdit = () => {
    if (editingPosition && editQuantity) {
      updatePosition(editingPosition, parseFloat(editQuantity));
    }
  };

  // Handle edit cancel
  const cancelEdit = () => {
    setEditingPosition(null);
    setEditQuantity("");
  };

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Portfolio</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Add New Position Form */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add New Position</h3>
        <form onSubmit={addPosition} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ticker Search Input */}
            <TickerSearchDropdown
              onSelect={selectTicker}
              ticker={newTicker}
              queryBecomesTicker={true}
              label="Ticker"
            />

            {/* Quantity Input */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                value={newQuantity}
                onChange={handleQuantityChange}
                placeholder="Enter quantity"
                step="0.01"
                min="0.01"
                max="1000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                required
              />
            </div>
          </div>

          {tickerError && (
            <div className="text-red-600 text-sm mt-1">{tickerError}</div>
          )}

          {quantityError && (
            <div className="text-red-600 text-sm mt-1">{quantityError}</div>
          )}

          <button
            type="submit"
            disabled={
              addingPosition ||
              !newTicker.trim() ||
              !newQuantity ||
              tickerError ||
              quantityError
            }
            className="px-4 py-2 bg-theme-primary text-white rounded-md hover:bg-theme-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingPosition ? "Adding..." : "Add Position"}
          </button>
        </form>
      </div>

      {/* Portfolio Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Your Positions</h3>
        </div>

        {positions.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No positions yet. Add your first position above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <PortfolioTable
              positions={positions}
              startEdit={startEdit}
              editingPosition={editingPosition}
              editQuantity={editQuantity}
              setEditQuantity={setEditQuantity}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              setDeleteConfirm={setDeleteConfirm}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 border border-gray-300 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the position for {deleteConfirm}?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePosition(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
      </div>
    </div>
  );
}

export default Portfolio;
