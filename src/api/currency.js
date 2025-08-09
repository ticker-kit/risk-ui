// Mock API for validating currency codes. Replace with real fetch when backend is ready.

const KNOWN = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "NZD", "SEK", "NOK", "DKK"];

function suggestFrom(input) {
  const up = (input || "").toUpperCase();
  const picks = new Set();
  for (const code of KNOWN) {
    if (code.startsWith(up[0] || "")) picks.add(code);
  }
  // Always include USD as a neutral suggestion
  picks.add("USD");
  return Array.from(picks).slice(0, 5);
}

export async function validateCurrency(code) {
  const up = (code || "").toUpperCase().trim();
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 400));

  if (!/^[A-Z]{3}$/.test(up)) {
    return {
      ok: false,
      message: "Code must be 3 letters",
      suggestions: suggestFrom(up),
    };
  }

  if (!KNOWN.includes(up)) {
    return {
      ok: false,
      message: `${up} not recognized`,
      suggestions: suggestFrom(up),
    };
  }

  return { ok: true, message: `${up} accepted` };
}
