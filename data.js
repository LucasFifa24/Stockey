// data.js — FINAL WORKING VERSION (Twelve Data)

const API_KEY = "77ff81accb7449078076fa13c52a3c32";

/* =========================
   AI SIGNAL LOGIC
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
  symbol = symbol.toUpperCase();

  const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  // Invalid symbol handling
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
