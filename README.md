# z-score-mean-reversion
Implements a daily long/short residual mean-reversion backtest using Alpaca historical bars, rolling OLS residualization versus market, sector ETF, and style ETFs, relative-volume confirmation, sector-neutral entry weighting, 3-day max holding period, and summary performance metrics.

#Summary
Instead of fading raw price moves, fade stock-specific residual moves after removing market, sector, and style-factor effects. Add a same-day or prior-day volume shock filter so trades are taken only when the residual dislocation likely reflects temporary order imbalance rather than broad factor repricing.

#Edge Hypothesis
Residual reversal is cleaner than total-return reversal because it strips out broad factor moves that may legitimately persist. Volume shock confirmation identifies episodes of stock-specific pressure where liquidity providers are more likely to be paid as the idiosyncratic move mean-reverts.

#Assumptions
• Universe is a fixed liquid large-cap list with manually mapped sector ETFs for stable factor estimation.
• Style factors are proxied with liquid ETFs: IWM, MTUM, QUAL, USMV, and VLUE.
• Orders are assumed filled at next-day close proxy using daily bars; no slippage, commissions, borrow fees, or locate constraints are modeled.
• Relative volume uses prior-day volume by default to avoid same-day lookahead on daily bars.
• Sector neutrality is approximated by demeaning target weights within sector groups before gross exposure scaling.

#Redflags
⚠ Requires robust factor model estimation and careful handling of unstable betas.
⚠ Residual signals can still be contaminated by firm-specific news.
⚠ Sector-neutral construction reduces but does not eliminate crowding risk.
⚠ Borrow and locate constraints can reduce short-side capacity.
