import { useState, useRef, useEffect, useMemo } from "react";
import * as AppConstants from "../constants";

export default function CurrencySelect({
  assetCurrency,
  userCurrency,
  value,
  onChangeValue,
}) {
  const rootRef = useRef(null);
  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);

  const options = useMemo(() => {
    const result = [
      {
        code: value,
        label:
          value +
          (value == assetCurrency
            ? " (Asset)"
            : value == userCurrency
            ? " (Home)"
            : ""),
      },
    ];

    if (value != assetCurrency) {
      result.push({ code: assetCurrency, label: assetCurrency + " (Asset)" });
    }

    if (userCurrency && value != userCurrency) {
      result.push({ code: userCurrency, label: userCurrency + " (Home)" });
    }

    AppConstants.POPULAR_CURRENCIES.forEach((code) => {
      if (code !== value && code !== assetCurrency && code !== userCurrency) {
        result.push({ code, label: code });
      }
    });

    return result;
  }, [userCurrency, assetCurrency, value]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    // const onKey = (e) => {
    //   if (
    //     e.key === "Escape" &&
    //     dropdownRef.current &&
    //     dropdownRef.current.contains(document.activeElement)
    //   )
    //     setOpen(false);
    // };

    document.addEventListener("mousedown", handleClickOutside);
    // document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      //   document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full min-w-[120px] px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="font-semibold tracking-wide">
          {options.find((o) => o.code === value)?.label || value}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full min-w-[120px] rounded-md bg-white shadow-lg border border-gray-200"
        >
          <ul role="listbox" className="py-1">
            {options.map((option) => {
              const isSelected = option.code === value;
              return (
                <li
                  key={option.code}
                  className={[
                    "px-3 py-2 cursor-pointer hover:bg-gray-100",
                    isSelected ? "bg-blue-50 font-semibold" : "font-normal",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChangeValue(option.code);
                      setOpen(false);
                    }}
                    className="w-full text-left"
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
