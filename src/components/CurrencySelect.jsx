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
    const result = [...AppConstants.POPULAR_CURRENCIES];
    if (userCurrency) {
      result.unshift(userCurrency);
    }

    if (assetCurrency) {
      result.unshift(assetCurrency);
    }

    if (value) {
      result.unshift(value);
    }

    return [...new Set(result)];
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
      <button type="button" onClick={() => setOpen((o) => !o)}>
        <span className="font-semibold tracking-wide">{value}</span>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg"
        >
          <ul role="listbox">
            {Array.from(options).map((option, idx) => {
              const isSelected = option === value;
              // const isActive = idx === activeIdx;
              return (
                <li
                  key={option}
                  className={[
                    "px-3 py-2 cursor-pointer",
                    //   isActive ? "bg-black/5" : "",
                    isSelected ? "font-semibold" : "font-normal",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChangeValue(option);
                      setOpen(false);
                    }}
                  >
                    {option}
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
