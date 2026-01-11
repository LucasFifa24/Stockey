// data.js

/* ========== CRYPTO (CoinGecko) ========== */

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

/* ========== STOCKS / FOREX / INDICES (STOOQ) ========== */

async function getStooqData(symbol) {
  let s = symbol.toLowerCase();

  if (!s.includes(".") && /^[a-z]+$/i.test(s)) {
    s += ".us";
  }

  const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const apiUrl = `https://stooq.com/q/l/?s=${s}&f=sd2t2ohlcv&h&e=json`;
  const res = await fetch(proxyUrl + apiUrl);
  const json = await res.json();
  const data = json.data[0];

  if (!data || data.close === null) return null;

  const open = parseFloat(data.open);
  const close = parseFloat(data.close);
  const change = ((close - open) / open) * 100;

  return {
    price: close,
    change: change
  };
}


/* ========== AI SIGNAL ========== */

function getSignal(change) {
  if (change > 1.2) return "BUY";
  if (change < -1.2) return "SELL";
  return "HOLD";
}

/* ========== UNIVERSAL FETCH ========== */

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

  // Stocks / Forex / Indices
  const d = await getStooqData(symbol);
  if (!d) return null;

  return {
    price: d.price,
    change: d.change,
    signal: getSignal(d.change)
  };
}
