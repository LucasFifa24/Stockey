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
