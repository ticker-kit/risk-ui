import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Improved currency picker component with compact design
 * @param {Object} props - Component props
 * @param {string} [props.initial="USD"] - Initial currency code if user has no currency set
 */
export default function HomeCurrencyPicker({ initial = "USD" }) {
  const { token, user, updateUserCurrency } = useAuth();

  const [value, setValue] = useState((user?.currency || initial || "USD").toUpperCase());
  const [status, setStatus] = useState("idle"); // idle | saving | success | error
  const [suggestions, setSuggestions] = useState([]);
  const [serverMessage, setServerMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  // Update value when user currency changes
  useEffect(() => {
    setValue((user?.currency || initial || "USD").toUpperCase());
  }, [user?.currency, initial]);

  const startEditing = () => {
    setEditValue(value);
    setIsEditing(true);
    setStatus("idle");
    setSuggestions([]);
    setServerMessage("");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue("");
    setStatus("idle");
    setSuggestions([]);
    setServerMessage("");
  };

  const submit = async (customCode = null) => {
    const code = (customCode || editValue).trim().toUpperCase();
    setEditValue(code);
    if (!code) return;

    setStatus("saving");
    setSuggestions([]);
    setServerMessage("");
    try {
      const response = await fetch(
        `${API_BASE}/home_currency?code=${encodeURIComponent(code)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const res = await response.json();
      setServerMessage(res?.message || "");

      if (response.ok && res?.success) {
        setStatus("success");
        setValue(code);
        // Update user context with new currency
        updateUserCurrency(code);
        setTimeout(() => {
          setStatus("idle");
          setIsEditing(false);
          setEditValue("");
        }, 1200);
      } else {
        setStatus("error");
        setSuggestions(Array.isArray(res?.recommendations) ? res.recommendations : []);
      }
    } catch {
      setStatus("error");
      setServerMessage("Network error - please try again");
    }
  };

  const onSubmit = (e) => {
    e?.preventDefault?.();
    submit();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  const borderColor =
    status === "error"
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : status === "success"
      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500";

  // Compact display when not editing
  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={startEditing}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          title="Click to change currency"
        >
          <span className="font-semibold">{value}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        {status === "success" && (
          <span className="text-green-600 text-xs" aria-live="polite">
            ✓
          </span>
        )}
      </div>
    );
  }

  // Editing interface
  return (
    <div className="inline-block">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <input
          aria-label="Currency"
          type="text"
          inputMode="text"
          maxLength={3}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value.toUpperCase())}
          onKeyDown={onKeyDown}
          placeholder="USD"
          autoFocus
          className={`w-20 rounded-md border bg-white px-2 py-1 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1 ${borderColor}`}
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="Save currency"
        >
          {status === "saving" ? "…" : "Save"}
        </button>
        <button
          type="button"
          onClick={cancelEditing}
          className="inline-flex items-center rounded-md bg-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          title="Cancel editing"
        >
          Cancel
        </button>
      </form>
      
      {/* Status messages */}
      {status !== "idle" && serverMessage && (
        <div
          className={`text-[11px] mt-1 ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {serverMessage}
        </div>
      )}
      
      {/* Suggestions */}
      {status === "error" && suggestions?.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 hover:bg-gray-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
