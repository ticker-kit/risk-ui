import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import HomeCurrencyPicker from "./components/HomeCurrencyPicker";
import { validateCurrency } from "./api/currency";

export default function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const navigation = [
    { name: "Home", href: "/", disabled: false },
    { name: "Ticker Metrics", href: "/ticker", disabled: false },
    { name: "Portfolio", href: "/portfolio", disabled: !isAuthenticated },
  ];

  // Local NavigationItem component
  const NavigationItem = ({ item, isMobile = false, className = "" }) => {
    if (item.disabled) {
      return (
        <span
          key={item.name}
          aria-disabled="true"
          className={`${className} opacity-60`}
        >
          {item.name}
        </span>
      );
    }

    const handleClick = () => {
      if (isMobile) {
        setMobileOpen(false);
      }
    };

    return (
      <NavLink
        key={item.name}
        to={item.href}
        end={item.href === "/"}
        onClick={handleClick}
        className={({ isActive }) =>
          isActive
            ? `${className} font-semibold underline`
            : `${className} hover:underline`
        }
      >
        {item.name}
      </NavLink>
    );
  };

  // Close account dropdown on outside click or Esc
  useEffect(() => {
    // if (!accountOpen) return;

    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-blue-700 text-white">
      <div className="px-4">
        <div className="flex items-center h-16">
          {/* Left: burger + desktop links */}
          <div className="flex-1 flex items-center">
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className="sm:hidden p-2"
            >
              {mobileOpen ? (
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
            <div className="hidden sm:flex gap-2 ml-2">
              {navigation.map((item) => (
                <NavigationItem
                  key={item.name}
                  item={item}
                  isMobile={false}
                  className="px-2 py-1"
                />
              ))}
            </div>
          </div>

          {/* Center: Logo */}
          <div className="flex items-center">
            <NavLink to="/">
              <img alt="Logo" src="/logo.svg" className="h-8 w-auto" />
            </NavLink>
          </div>

          {/* Right: Auth actions (always visible) */}
          <div className="flex-1 flex items-center justify-end">
            {isAuthenticated ? (
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((o) => !o)}
                  className="flex items-center gap-2 px-2 py-1"
                >
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </span>
                </button>
                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded bg-white text-gray-900 shadow z-10"
                  >
                    <div className="px-4 py-2 text-sm">Hi {user?.username}</div>
                    <div className="px-4 py-2 border-t">
                      <HomeCurrencyPicker onValidate={validateCurrency} />
                    </div>
                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/login" className="px-3 py-2 hover:underline">
                Login
              </NavLink>
            )}
          </div>
        </div>

        {/* Mobile menu: nav links only */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-blue-600">
            <div className="absolute bg-blue-700 -mx-4 z-10">
              {navigation.map((item) => (
                <NavigationItem
                  key={item.name}
                  item={item}
                  isMobile={true}
                  setMobileOpen={setMobileOpen}
                  className="block px-4 py-2"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
