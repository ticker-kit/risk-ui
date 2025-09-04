import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import HomeCurrencyPicker from "./components/HomeCurrencyPicker";

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
    <nav className="bg-theme-primary text-white">
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
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-theme-primary-dark transition-colors duration-200"
                >
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-theme-primary font-semibold text-sm shadow-sm">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </span>
                  <svg className="h-4 w-4 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-3 w-64 rounded-lg bg-white text-gray-900 shadow-lg border border-gray-200 z-10"
                  >
                    {/* User greeting section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-theme-primary text-white font-semibold">
                          {user?.username?.[0]?.toUpperCase() || "U"}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Hi, {user?.username}</p>
                          <p className="text-xs text-gray-500">Manage your account</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Currency picker section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Currency</span>
                      </div>
                      <HomeCurrencyPicker initial={user?.currency} />
                    </div>
                    
                    {/* Sign out section */}
                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 rounded-b-lg"
                      role="menuitem"
                    >
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
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
          <div className="sm:hidden border-t border-theme-primary">
            <div className="absolute bg-theme-primary -mx-4 z-10">
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
