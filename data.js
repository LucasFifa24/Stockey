

const CRYPTO = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana"
};

async function getCryptoPrice(symbol) {
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

async function getMarketData(symbol) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
  const res = await fetch(url);
  const data = await res.json();
  const q = data.quoteResponse.result[0];
  if (!q) return null;

  return {
    price: q.regularMarketPrice,
    change: q.regularMarketChangePercent
  };
}

// --- AI SIGNAL ---
function getSignal(change) {
  if (change > 1.5) return "BUY";
  if (change < -1.5) return "SELL";
  return "HOLD";
}

// --- UNIVERSAL ---
async function getAsset(symbol) {
  symbol = symbol.toUpperCase();

  if (CRYPTO[symbol]) {
    const d = await getCryptoPrice(symbol);
    return {
      price: d.price,
      change: d.change,
      signal: getSignal(d.change)
    };
  }

  const d = await getMarketData(symbol);
  return {
    price: d.price,
    change: d.change,
    signal: getSignal(d.change)
  };
}
