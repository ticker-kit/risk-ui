import { useState } from 'react';

// Create a demo version of HomeCurrencyPicker that doesn't need authentication
function DemoHomeCurrencyPicker({ initial = "USD" }) {
  const [value, setValue] = useState((initial || "USD").toUpperCase());
  const [status, setStatus] = useState("idle"); // idle | saving | success | error
  const [suggestions, setSuggestions] = useState([]);
  const [serverMessage, setServerMessage] = useState("");

  const submit = async () => {
    const code = value.trim().toUpperCase();
    setValue(code);
    if (!code) return;

    setStatus("saving");
    setSuggestions([]);
    setServerMessage("");
    
    // Mock API response
    setTimeout(() => {
      if (code === "XXX") {
        setStatus("error");
        setSuggestions(["USD", "EUR", "GBP", "JPY"]);
        setServerMessage("Currency not recognized");
      } else if (!/^[A-Z]{3}$/.test(code)) {
        setStatus("error");
        setServerMessage("Code must be 3 letters");
        setSuggestions(["USD", "EUR", "GBP"]);
      } else {
        setStatus("success");
        setServerMessage(`Currency set to ${code}`);
        setTimeout(() => setStatus("idle"), 1200);
      }
    }, 800);
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

export default function CurrencyPickerDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Currency Picker Design Demo</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Design (Issue)</h2>
          <p className="text-gray-600 mb-4">
            The current HomeCurrencyPicker always shows an input field and button, 
            which takes up space even when not actively being used.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 p-4 rounded">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Home Currency:</span>
              <DemoHomeCurrencyPicker initial="USD" />
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Try typing different currency codes. Use "XXX" to trigger error state.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Design Improvement Needed</h2>
          <p className="text-gray-700">
            The user wants a better design that doesn't always show the input and button.
            A more compact, dropdown-style interface would be preferable.
          </p>
        </div>
      </div>
    </div>
  );
}