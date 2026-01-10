// data.js

const COINS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana"
};

// Function to get the current price of a crypto symbol
async function getCryptoPrice(symbol) {
  const id = COINS[symbol];
  if (!id) {
    console.error("Invalid symbol:", symbol);
    return null;
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
    );
    const data = await res.json();
    return data[id].usd;
  } catch (error) {
    console.error("Error fetching price:", error);
    return null;
  }
}
