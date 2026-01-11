// data.js

const API_KEY = "1bf7c3ac-16ce-458a-a3a8-4f8431d69969";

// --- CRYPTO (CoinGecko) ---
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

// --- STOCKS / FOREX (Polygon) ---
async function getMarketData(symbol) {
  const url = `https://api.polygon.io/v1/last/trade/${symbol}?apiKey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data || !data.last) return null;

  const price = data.last.price;
  const change = data.last.percent_change;

  // Check if the market is open (Polygon does not directly provide market status, so we assume if there’s no data, the market is closed)
  if (!data.last) {
    return {
      price: "Market closed",
      change: null
    };
  }

  return {
    price: price,
    change: change
  };
}

// --- AI SIGNAL ---
function getSignal(change) {
  if (change > 1.2) return "BUY";
  if (change < -1.2) return "SELL";
  return "HOLD";
}

// --- UNIVERSAL FETCH ---
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

  // Stocks / Forex
  const d = await getMarketData(symbol);
  if (!d) return null;

  // If the market is closed, we can show the last price or a message
  return {
    price: d.price === "Market closed" ? "Market closed" : d.price,
    change: d.change,
    signal: d.change !== null ? getSignal(d.change) : null
  };
}
