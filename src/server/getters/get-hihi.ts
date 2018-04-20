import * as Knex from "knex";
import { Address, OutcomesRow, UITrade } from "../../types";
import { getUserTradingHistory } from "./get-user-trading-history";
import * as _ from "lodash";
import Augur from "augur.js";
import { map } from "async";


export interface CategoriesRow {
  category: string;
  popularity: number|string;
}

export function getHihi(db: Knex, augur: Augur, universe: Address, sortBy: string|null|undefined, isSortDescending: boolean|null|undefined, limit: number|null|undefined, offset: number|null|undefined, callback: (err: Error|null, result?: any) => void): void {
  getUserTradingHistory(db, universe, "0x0000000000000000000000000000000000000b0b", null, null, null, null, null, null, null, null, null, (err: Error|null, userTradingHistory?: Array<UITrade>): void => {
    if (err) return callback(err);
    if (!userTradingHistory || !userTradingHistory.length) return callback(null, { realized: "0", unrealized: "0", position: "0", meanOpenPrice: "0", queued: "0" });
    const tradesByMarketOutcome = _.groupBy(userTradingHistory, (userTrade) => `${userTrade.marketId}-${userTrade.outcome}`);
    const f = map(tradesByMarketOutcome, (trades, next: (err: Error|null, val?: any) => void) => {
      db.first("price").from("outcomes").where({ marketId: trades[0].marketId, outcome: trades[0].outcome }).asCallback((err: Error|null, outcomesRow?: Partial<OutcomesRow<BigNumber>>): void => {
        if (err) return callback(err);
        if (!outcomesRow) return callback(null);
        const r = augur.trading.calculateProfitLoss({ trades: trades || [], lastPrice: outcomesRow.price! });
        next(null, r);
      });
    }, (err, blah) => {
      return callback(null, blah);
    });
  });
  // db.first("price").from("outcomes").where({ marketId, outcome }).asCallback((err: Error|null, outcomesRow?: Partial<OutcomesRow<BigNumber>>): void => {
  //   if (err) return callback(err);
  //   if (!outcomesRow) return callback(null);
  //   callback(null, augur.trading.calculateProfitLoss({ trades: userTradingHistory || [], lastPrice: outcomesRow.price! }));
  // });
}
