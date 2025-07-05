## ✅ Pages to Build

### 1. **Ticker Metrics Page (`/metrics`)**

* Input for a single ticker
* Show metrics in **cards**
* Use **tabs** to switch between:

  * Table view
  * Bar/line chart (Sharpe, Volatility, etc.)
* Bonus: Show recent price chart (e.g. from Yahoo or dummy)

---

### 2. **Portfolio Page (`/portfolio`)**

* Fallback portfolio data: e.g., `[{ ticker: "AAPL", shares: 10 }, ...]`
* Render a **table** or list
* Ability to:

  * ➕ Add new asset (form)
  * 📝 Edit existing asset
  * ❌ Remove asset
* Charts:

  * Pie chart (e.g., by position value)
  * Line chart (e.g., aggregated value over time)

---

## ⚙️ Tools and Features to Showcase

| Feature       | Tool/Library                         |
| ------------- | ------------------------------------ |
| Routing       | `react-router-dom`                   |
| Styling       | `tailwindcss`                        |
| Tabs          | Tailwind UI                          |
| Charts        | `recharts`                           |
| Forms         | Controlled inputs + Tailwind styling |
| Data handling | Local state now → DB later           |

---

