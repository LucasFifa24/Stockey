// data.js

// --- CRYPTO (CoinGecko) ---
const CRYPTO = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana"
};

async function getCryptoPrice(symbol) {
  const id = CRYPTO[symbol];
  if (!id) return null;

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
  );
  const data = await res.json();
  return data[id].usd;
}

// --- STOCKS / FOREX / INDICES (Yahoo Finance) ---
async function getMarketPrice(symbol) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
  const res = await fetch(url);
  const data = await res.json();

  const quote = data.quoteResponse.result[0];
  if (!quote || !quote.regularMarketPrice) return null;

  return quote.regularMarketPrice;
}

// --- UNIVERSAL ---
async function getPrice(symbol) {
  symbol = symbol.toUpperCase();

  // Crypto first
  if (CRYPTO[symbol]) {
    return await getCryptoPrice(symbol);
  }

  // Stocks / Forex / Indices
  return await getMarketPrice(symbol);
}
