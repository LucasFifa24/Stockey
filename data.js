const API_KEY = "77ff81accb7449078076fa13c52a3c32";

// Index symbol mapping
const INDEX_MAP = {
  "SP500": "SPX",
  "NASDAQ": "NDX",
  "DOW": "DJI",
  "VIX": "VIX"
};

// AI signal logic
function getSignal(change) {
  if (change > 1) return "BUY";
  if (change < -1) return "SELL";
  return "HOLD";
}

// Fetch asset data
async function getAsset(symbol, timeframe) {
  symbol = symbol.toUpperCase().replace(/\s+/g, "");

  if (INDEX_MAP[symbol]) {
    symbol = INDEX_MAP[symbol];
  }

  const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status === "error" || !data.close) {
    return { error: true };
  }

  const open = parseFloat(data.open);
  const close = parseFloat(data.close);
  const change = ((close - open) / open) * 100;

  return {
    price: close,
    change,
    signal: getSignal(change)
  };
}

// Fetch time series data for chart
async function getTimeSeries(symbol, interval) {
  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.values) return null;

  const labels = data.values.map(v => v.datetime).reverse();
  const prices = data.values.map(v => parseFloat(v.close)).reverse();

  return { labels, prices };
}
