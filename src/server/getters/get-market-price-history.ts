import * as t from "io-ts";
import * as Knex from "knex";
import { BigNumber } from "bignumber.js";
import Augur from "augur.js";
import { MarketPriceHistory, SortLimitParams, TimestampedPriceAmount } from "../../types";
import { formatBigNumberAsFixed } from "../../utils/format-big-number-as-fixed";
import { sortDirection } from "../../utils/sort-direction";

export const MarketPriceHistoryParamsSpecific = t.type({
  marketId: t.string,
});

export const MarketPriceHistoryParams = t.intersection([
  MarketPriceHistoryParamsSpecific,
  SortLimitParams,
]);

interface MarketPriceHistoryRow {
  timestamp: number;
  outcome: number;
  price: BigNumber;
  amount: BigNumber;
}

// Input: MarketId
// Output: { outcome: [{ price, timestamp }] }
export async function getMarketPriceHistory(db: Knex, augur: Augur, params: t.TypeOf<typeof MarketPriceHistoryParams>): Promise<MarketPriceHistory<string>> {
  let query = db.select([
    "trades.outcome",
    "trades.price",
    "trades.amount",
    "blocks.timestamp",
  ]).from("trades").leftJoin("blocks", "trades.blockNumber", "blocks.blockNumber").where({ marketId: params.marketId });
  if (params.sortBy) {
    query = query.orderBy(params.sortBy, sortDirection(params.isSortDescending, "desc"));
  }
  if (params.limit) {
    query = query.limit(params.limit);
  }
  const tradesRows: Array<MarketPriceHistoryRow> = await query;
  if (!tradesRows) throw new Error("Internal error retrieving market price history");
  const marketPriceHistory: MarketPriceHistory<string> = {};
  tradesRows.forEach((trade: MarketPriceHistoryRow): void => {
    if (!marketPriceHistory[trade.outcome]) marketPriceHistory[trade.outcome] = [];
    marketPriceHistory[trade.outcome].push(formatBigNumberAsFixed<TimestampedPriceAmount<BigNumber>, TimestampedPriceAmount<string>>({
      price: trade.price,
      timestamp: trade.timestamp,
      amount: trade.amount,
    }));
  });
  return marketPriceHistory;
}
