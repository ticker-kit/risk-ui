import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Currency picker component that allows users to change their home currency
 * @param {Object} props - Component props
 * @param {string} [props.initial="USD"] - Initial currency code if user has no currency set
 */
export default function HomeCurrencyPicker({ initial = "USD" }) {
  const { token, user, updateUserCurrency } = useAuth();

  const [value, setValue] = useState((user?.currency || initial || "USD").toUpperCase());
  const [status, setStatus] = useState("idle"); // idle | saving | success | error
  const [suggestions, setSuggestions] = useState([]);
  const [serverMessage, setServerMessage] = useState("");

  // Update value when user currency changes
  useEffect(() => {
    setValue((user?.currency || initial || "USD").toUpperCase());
  }, [user?.currency, initial]);

  const submit = async () => {
    const code = value.trim().toUpperCase();
    setValue(code);
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
        // Update user context with new currency
        updateUserCurrency(code);
        setTimeout(() => setStatus("idle"), 1200);
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
    }
  };

  const borderColor =
    status === "error"
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : status === "success"
      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500";

  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-center gap-2">
        <input
          aria-label="Currency"
          id="homeCurrency"
          type="text"
          inputMode="text"
          maxLength={3}
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          onKeyDown={onKeyDown}
          placeholder="USD"
          className={`w-20 rounded-md border bg-white px-2 py-1 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1 ${borderColor}`}
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="Set currency"
        >
          {status === "saving" ? "…" : "Set"}
        </button>
      </div>
      {status === "success" && (
        <span className="text-green-600 text-[11px]" aria-live="polite">
          ✓
        </span>
      )}
      {/* {status === "error" && (
        <span className="text-red-600 text-[11px]" aria-live="polite">
          Invalid
        </span>
      )} */}
      {status !== "idle" && serverMessage && (
        <div
          className={`text-[11px] mt-1 ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {serverMessage}
        </div>
      )}
      {status === "error" && suggestions?.length > 0 && (
        <div className="ml-1 flex flex-wrap gap-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue(s.toUpperCase())}
              className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 hover:bg-gray-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
