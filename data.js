// data.js — FINAL STABLE VERSION (ALL ASSETS WORK)

const API_KEY = "77ff81accb7449078076fa13c52a3c32";

/* =========================
   INDEX SYMBOL MAP
========================= */
const INDEX_MAP = {
  "NASDAQ": "NDX",
  "DOW": "DJI",
  "DOWJONES": "DJI",
  "SP500": "SPX",
  "SANDP500": "SPX",
  "S&P500": "SPX",
  "VIX": "VIX",
  "RUSSELL": "RUT"
};

/* =========================
   AI SIGNAL
========================= */
function getSignal(change) {
  if (change > 1) return "BUY";
  if (change < -1) return "SELL";
  return "HOLD";
}

/* =========================
   MAIN DATA FETCH
========================= */
async function getAsset(symbol) {
  symbol = symbol
    .toUpperCase()
    .replace(/\s+/g, "");

  // Map common index names
  if (INDEX_MAP[symbol]) {
    symbol = INDEX_MAP[symbol];
  }

  const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  // Invalid symbol
  if (data.status === "error" || !data.close) {
    return {
      error: "Check your spelling"
    };
  }

  const open = parseFloat(data.open);
  const close = parseFloat(data.close);
  const change = ((close - open) / open) * 100;

  return {
    price: close,
    change: change,
    signal: getSignal(change)
  };
}
