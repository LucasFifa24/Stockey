// data.js — FINAL, STABLE VERSION (Polygon Free + CoinGecko)

const API_KEY = "1bf7c3ac-16ce-458a-a3a8-4f8431d69969";

/* =======================
   CRYPTO (CoinGecko)
======================= */

const CRYPTO = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana"
};

async function getCryptoData(symbol) {
  const id = CRYPTO[symbol];
  if (!id) return null;

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`
  );
  const data = await res.json();

  return {
    price: data[id].usd,
    change: data[id].usd_24h_change
  };
}

/* =======================
   STOCKS (Polygon FREE)
   Uses PREVIOUS CLOSE
======================= */

async function getStockData(symbol) {
  const s = symbol.toUpperCase();

  const url = `https://api.polygon.io/v2/aggs/ticker/${s}/prev?adjusted=true&apiKey=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (!json.results || json.results.length === 0) return null;

  const data = json.results[0];

  const open = data.o;
  const close = data.c;
  const change = ((close - open) / open) * 100;

  return {
    price: close,
    change: change
  };
}

/* =======================
   AI SIGNAL
======================= */

function getSignal(change) {
  if (change > 1) return "BUY";
  if (change < -1) return "SELL";
  return "HOLD";
}

/* =======================
   UNIVERSAL FETCH
======================= */

async function getAsset(symbol) {
  symbol = symbol.toUpperCase();

  // Crypto
  if (CRYPTO[symbol]) {
    const d = await getCryptoData(symbol);
    if (!d) return null;

    return {
      price: d.price,
      change: d.change,
      signal: getSignal(d.change)
    };
  }

  // Stocks
  const d = await getStockData(symbol);
  if (!d) return null;

  return {
    price: d.price,
    change: d.change,
    signal: getSignal(d.change)
  };
}
