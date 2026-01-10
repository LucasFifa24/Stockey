async function getCryptoPrice(symbol) {
  const map = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana"
  };

  const id = map[symbol];
  if (!id) return null;

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
  );
  const data = await res.json();
  return data[id].usd;
}
async function getAIBias(symbol) {
  const map = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana"
  };

  const id = map[symbol];
  if (!id) return null;

  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1`
  );
  const data = await res.json();

  const prices = data.prices;
  const oldPrice = prices[0][1];
  const currentPrice = prices[prices.length - 1][1];

  const change = ((currentPrice - oldPrice) / oldPrice) * 100;

  let bias = "Neutral";
  let confidence = Math.abs(change).toFixed(2);

  if (change > 1) bias = "Bullish 📈";
  else if (change < -1) bias = "Bearish 📉";

  return {
    bias,
    confidence,
    change: change.toFixed(2)
  };
}

