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
 * }} PortfolioPosition
 */

function PortfolioTable({
  positions,
  startEdit,
  editingPosition,
  editQuantity,
  setEditQuantity,
  saveEdit,
  cancelEdit,
  setDeleteConfirm,
}) {
  return (
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Ticker
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Quantity
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Price
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Value
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {positions.map((position) => (
          <tr key={position.ticker} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {position.ticker}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {editingPosition === position.ticker ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    step="0.01"
                    min="0.01"
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={saveEdit}
                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-900">{position.quantity}</div>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {position.regularMarketPrice.toFixed(2)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {(
                  position.regularMarketPrice * position.quantity
                ).toLocaleString(undefined, {
                  style: "currency",
                  currency: position.currency,
                  maximumFractionDigits: 0,
                  currencyDisplay: "code",
                })}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center space-x-2">
                {editingPosition === position.ticker ? null : (
                  <button
                    onClick={() => startEdit(position)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setDeleteConfirm(position.ticker)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default PortfolioTable;
