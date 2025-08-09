import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API_BASE = import.meta.env.VITE_API_URL;

export default function HomeCurrencyPicker({ initial = "USD", onValidate }) {
  const { token } = useAuth();

  const [value, setValue] = useState((initial || "USD").toUpperCase());
  const [status, setStatus] = useState("idle"); // idle | saving | success | error
  const [suggestions, setSuggestions] = useState([]);
  const [serverMessage, setServerMessage] = useState("");

  const fallbackValidate = async (code) => {
    // Minimal client-side check until API is wired
    const ok = /^[A-Z]{3}$/.test(code);
    return { ok, message: ok ? "Saved" : "Invalid currency code" };
  };

  const submit = async () => {
    const code = value.trim().toUpperCase();
    setValue(code);
    if (!code) return;

    setStatus("saving");
    setSuggestions([]);
    setServerMessage("");
    try {
      //   const res = await (onValidate
      //     ? onValidate(code)
      //     : fallbackValidate(code));

      const response = await fetch(
        `${API_BASE}/home_currency?code=${encodeURIComponent(code)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const res = await response.json();

      setServerMessage(res?.message || "");
      if (res?.ok) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 1200);
      } else {
        setStatus("error");
        setSuggestions(Array.isArray(res?.suggestions) ? res.suggestions : []);
      }
    } catch {
      setStatus("error");
      setServerMessage("Something went wrong");
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
        <span
          className={`text-[11px] ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {serverMessage}
        </span>
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
