const baseMetrics = [
  { label: "Portfolio value", value: "$124,680", detail: "↑ 2.84% this month", type: "up" },
  { label: "Total return", value: "+24.68%", detail: "Factor neutral", type: "up" },
  { label: "Sharpe ratio", value: "1.82", detail: "↑ 0.14 vs. last run", type: "up" },
  { label: "Max drawdown", value: "−8.42%", detail: "Within 10% limit", type: "down" }
];

const diagnostics = [
  { name: "Net return", value: "+24.68%", type: "up" },
  { name: "Volatility", value: "12.4%" },
  { name: "Turnover", value: "0.84" },
  { name: "Win rate", value: "58.2%" }
];

const positions = [
  { symbol: "NVDA", sector: "Technology · XLK", side: "SHORT", weight: "−8.33%", entry: "$121.40", hold: "4d", pnl: "+$186.42", pnlType: "up" },
  { symbol: "JPM", sector: "Financials · XLF", side: "LONG", weight: "+8.33%", entry: "$211.72", hold: "3d", pnl: "+$94.10", pnlType: "up" },
  { symbol: "XOM", sector: "Energy · XLE", side: "SHORT", weight: "−8.33%", entry: "$117.68", hold: "2d", pnl: "−$42.88", pnlType: "down" },
  { symbol: "AMZN", sector: "Consumer · XLY", side: "LONG", weight: "+8.33%", entry: "$188.11", hold: "2d", pnl: "+$77.65", pnlType: "up" },
  { symbol: "PFE", sector: "Health care · XLV", side: "SHORT", weight: "−8.33%", entry: "$29.15", hold: "1d", pnl: "+$23.40", pnlType: "up" }
];

const signalSets = [
  [{ ticker: "AMD", company: "Z-score −2.41 · RVOL 1.84×", kind: "BUY", group: "buy" }, { ticker: "LLY", company: "Z-score +2.31 · RVOL 2.02×", kind: "SELL", group: "sell" }, { ticker: "CAT", company: "Z-score −2.18 · RVOL 1.68×", kind: "BUY", group: "buy" }, { ticker: "META", company: "Z-score +2.12 · RVOL 1.73×", kind: "SELL", group: "sell" }],
  [{ ticker: "MU", company: "Z-score −2.56 · RVOL 1.91×", kind: "BUY", group: "buy" }, { ticker: "COST", company: "Z-score +2.29 · RVOL 1.67×", kind: "SELL", group: "sell" }, { ticker: "DE", company: "Z-score −2.09 · RVOL 1.59×", kind: "BUY", group: "buy" }, { ticker: "AVGO", company: "Z-score +2.22 · RVOL 1.88×", kind: "SELL", group: "sell" }]
];

const periods = {
  "1M": { return: 2.84, value: 124680, sharpe: 1.94, drawdown: 2.16, days: 21, points: [98,95,101,92,94,85,88,80,84,70,75,63,68,54,58,47,52,39,44,31,36,23] },
  "3M": { return: 8.72, value: 124680, sharpe: 1.88, drawdown: 4.68, days: 63, points: [102,107,99,103,91,97,86,92,79,84,75,81,65,72,58,64,51,57,43,49,34,39,23] },
  "1Y": { return: 24.68, value: 124680, sharpe: 1.82, drawdown: 8.42, days: 365, points: [187,181,186,164,171,145,153,136,143,126,140,120,128,108,118,104,113,92,104,84,91,70,79,91,68,76,57,65,48,59,39,47,34,43,23] },
  ALL: { return: 46.31, value: 146310, sharpe: 1.67, drawdown: 11.04, days: 742, points: [184,177,190,172,165,177,150,160,140,150,130,146,117,133,106,120,96,111,83,94,71,84,63,76,56,67,45,54,37,49,29,40,23] }
};

const formatMoney = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const toast = document.getElementById("toast");
const notify = message => { toast.textContent = message; toast.classList.add("show"); clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove("show"), 2800); };

function renderMetrics(metrics = baseMetrics) {
  document.getElementById("metrics").innerHTML = metrics.map(item => `<article class="metric-card"><div class="metric-label">${item.label}</div><div class="metric-value ${item.type}">${item.value}</div><div class="metric-detail ${item.type}">${item.detail}</div></article>`).join("");
}

function renderDiagnostics() {
  document.getElementById("diagnostics").innerHTML = diagnostics.map(item => `<div class="stat-row"><div class="stat-name">${item.name}</div><div class="stat-value ${item.type || ""}">${item.value}</div></div>`).join("");
}

let showAllPositions = false;
function renderPositions() {
  const visible = showAllPositions ? positions : positions.slice(0, 3);
  document.getElementById("positions-body").innerHTML = visible.map(stock => `<tr><td><div class="position-name">${stock.symbol}</div><div class="position-sector">${stock.sector}</div></td><td><span class="signal-badge ${stock.side === "LONG" ? "buy" : "sell"}">${stock.side}</span></td><td class="weight-cell">${stock.weight}</td><td>${stock.entry}</td><td>${stock.hold}</td><td class="${stock.pnlType}">${stock.pnl}</td></tr>`).join("");
  document.getElementById("all-positions").textContent = showAllPositions ? "Show less" : "All positions";
}

let signalSet = 0;
function renderSignals() {
  document.getElementById("signal-list").innerHTML = signalSets[signalSet].map(signal => `<div class="signal-row" data-ticker="${signal.ticker}"><div class="ticker">${signal.ticker}</div><div><div class="company">${signal.company}</div></div><span class="signal-badge ${signal.group}">${signal.kind}</span></div>`).join("");
  document.querySelectorAll(".signal-row").forEach(row => row.addEventListener("click", () => notify(`${row.dataset.ticker} selected for next-session review.`)));
}

function renderChart(period = "1Y") {
  const data = periods[period];
  const points = data.points.map((y, index) => `${index ? "L" : "M"}${Math.round(index * 714 / (data.points.length - 1))} ${y}`).join(" ");
  document.getElementById("equity-chart").innerHTML = `<defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#72b890" stop-opacity=".3"/><stop offset="1" stop-color="#72b890" stop-opacity="0"/></linearGradient></defs><line class="chart-grid" x1="0" y1="26" x2="720" y2="26"/><line class="chart-grid" x1="0" y1="75" x2="720" y2="75"/><line class="chart-grid" x1="0" y1="124" x2="720" y2="124"/><line class="chart-grid" x1="0" y1="173" x2="720" y2="173"/><path d="${points} L714 205 L0 205 Z" fill="url(#area)"/><path d="${points}" fill="none" stroke="#136f4a" stroke-width="2.5" vector-effect="non-scaling-stroke"/><text class="chart-axis" x="0" y="221">START</text><text class="chart-axis" x="650" y="221">TODAY</text>`;
  document.getElementById("chart-subtitle").textContent = `FACTOR-NEUTRAL MEAN REVERSION · ${data.days} TRADING DAYS`;
  document.getElementById("chart-tooltip").innerHTML = `<span>SEP 27, 2024</span>${formatMoney(data.value)} <b class="up">+${data.return.toFixed(2)}%</b>`;
  const updatedMetrics = [...baseMetrics];
  updatedMetrics[0] = { ...updatedMetrics[0], value: formatMoney(data.value) };
  updatedMetrics[1] = { ...updatedMetrics[1], value: `+${data.return.toFixed(2)}%` };
  updatedMetrics[2] = { ...updatedMetrics[2], value: data.sharpe.toFixed(2) };
  updatedMetrics[3] = { ...updatedMetrics[3], value: `−${data.drawdown.toFixed(2)}%` };
  renderMetrics(updatedMetrics);
}

function updateRangeFills() {
  const entry = document.getElementById("entry-z"), hold = document.getElementById("hold-days");
  document.getElementById("entry-z-value").textContent = `${Number(entry.value).toFixed(1)}σ`;
  document.getElementById("hold-days-value").textContent = `${hold.value} days`;
  entry.style.background = `linear-gradient(90deg, var(--green) ${(entry.value - 1) * 50}%, #e6ebe6 ${(entry.value - 1) * 50}%)`;
  const holdPercent = ((hold.value - 5) / 25) * 100;
  hold.style.background = `linear-gradient(90deg, var(--green) ${holdPercent}%, #e6ebe6 ${holdPercent}%)`;
}

document.querySelectorAll(".nav-item").forEach(item => item.addEventListener("click", () => { document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active")); item.classList.add("active"); document.querySelector(`.${item.dataset.target}`).scrollIntoView({ behavior: "smooth", block: "start" }); }));
document.querySelectorAll("[data-period]").forEach(button => button.addEventListener("click", () => { document.querySelectorAll("[data-period]").forEach(period => period.classList.remove("active")); button.classList.add("active"); renderChart(button.dataset.period); notify(`Equity curve updated to ${button.dataset.period}.`); }));
document.getElementById("all-positions").addEventListener("click", () => { showAllPositions = !showAllPositions; renderPositions(); notify(showAllPositions ? "All open positions are visible." : "Showing primary positions."); });
document.getElementById("refresh-signals").addEventListener("click", () => { signalSet = (signalSet + 1) % signalSets.length; renderSignals(); notify("Signal queue refreshed with the latest candidates."); });
document.getElementById("entry-z").addEventListener("input", updateRangeFills); document.getElementById("hold-days").addEventListener("input", updateRangeFills);
document.getElementById("run-btn").addEventListener("click", event => { const button = event.currentTarget; button.classList.add("running"); button.querySelector("span").textContent = "Running…"; setTimeout(() => { const entry = Number(document.getElementById("entry-z").value), hold = Number(document.getElementById("hold-days").value), total = 20.14 + (entry - 1) * 3.4 + (hold - 5) * .12; renderMetrics([{ ...baseMetrics[0], value: formatMoney(100000 * (1 + total / 100)) }, { ...baseMetrics[1], value: `+${total.toFixed(2)}%` }, { ...baseMetrics[2], value: (1.36 + (entry - 1) * .23 + (hold - 5) * .011).toFixed(2) }, baseMetrics[3]]); button.classList.remove("running"); button.querySelector("span").textContent = "Run backtest"; notify("Demo backtest complete — metrics refreshed."); }, 1000); });
document.getElementById("export-btn").addEventListener("click", () => { const rows = [["Metric", "Value"], ...[...document.querySelectorAll(".metric-card")].map(card => [card.querySelector(".metric-label").textContent, card.querySelector(".metric-value").textContent])]; const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([rows.map(row => row.join(",")).join("\n")], { type: "text/csv" })), download: "rivet-performance-report.csv" }); link.click(); URL.revokeObjectURL(link.href); notify("Performance report downloaded as CSV."); });

renderMetrics(); renderDiagnostics(); renderPositions(); renderSignals(); renderChart(); updateRangeFills();
