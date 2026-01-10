const COINS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana"
};

async function getCryptoPrice(symbol) {
  const id = COINS[symbol];
  if (!id) return null;

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
  );
  const data = await res.json();
  return data[id].usd;
}

async function getAIBias(symbol) {
  const id = COINS[symbol];
  if (!id) return null;

  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1`
  );
  const data = await res.json();

  const start = data.prices[0][1];
  const end = data.prices[data.prices.length - 1][1];
  const change = ((end - start) / start) * 100;

  let bias = "Neutral";
  if (change > 1) bias = "Bullish 📈";
  if (change < -1) bias = "Bearish 📉";

  return {
    bias,
    change: change.toFixed(2),
    confidence: Math.abs(change).toFixed(2)
  };
}
async function getHistoricalData(symbol) {
  const id = COINS[symbol];
  if (!id) return null;

  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1`
  );
  const data = await res.json();
  return data.prices; // Returns array of [timestamp, price]
}
