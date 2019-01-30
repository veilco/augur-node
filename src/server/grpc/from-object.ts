import { MarketInfo, NormalizedPayout as NormalizedPayoutProto, OutcomeInfo, ReportingState as ReportingStateProto, MarketPriceHistory as MarketPriceHistoryProto, TimestampedPriceAmount as TimestampedPriceAmountProto, ListTimestampedPriceAmount, GetOrdersResponse, Order as OrderProto, OrderState as OrderStateProto, OrderType as OrderTypeProto } from "../../../build-proto/augurMarkets_pb";
import { NormalizedPayout, ReportingState, UIMarketInfo, UIOutcomeInfo, MarketPriceHistory, TimestampedPriceAmount, UIOrders, UIOrder, OrderState } from "../../types";
import { AugurNodeOrderType } from "./augur-node-new-types";

export function marketInfoToProto(x: UIMarketInfo<string>): MarketInfo {
  const mi = new MarketInfo();
  mi.setId(x.id);
  mi.setUniverse(x.universe);
  mi.setMarketType(x.marketType);
  mi.setNumOutcomes(x.numOutcomes);
  mi.setMinPrice(x.minPrice);
  mi.setMaxPrice(x.maxPrice);
  mi.setCumulativeScale(x.cumulativeScale);
  mi.setAuthor(x.author);
  mi.setCreationTime(x.creationTime);
  mi.setCreationBlock(x.creationBlock);
  mi.setCreationFee(x.creationFee);
  mi.setSettlementFee(x.settlementFee);
  mi.setReportingFeeRate(x.reportingFeeRate);
  mi.setMarketCreatorFeeRate(x.marketCreatorFeeRate);
  if (x.marketCreatorFeesBalance !== null) {
    mi.setMarketCreatorFeesBalance(x.marketCreatorFeesBalance);
  }
  mi.setMarketCreatorMailbox(x.marketCreatorMailbox);
  mi.setMarketCreatorMailboxOwner(x.marketCreatorMailboxOwner);
  if (x.initialReportSize !== null) {
    mi.setInitialReportSize(x.initialReportSize);
  }
  mi.setCategory(x.category);
  x.tags.forEach((tag) => {
    if (tag !== null) {
      mi.addTags(tag);
    }
  });
  mi.setVolume(x.volume);
  mi.setOutstandingShares(x.openInterest);
  mi.setFeeWindow(x.feeWindow);
  mi.setEndTime(x.endTime);
  if (x.finalizationBlockNumber !== null && x.finalizationBlockNumber !== undefined) {
    mi.setFinalizationBlockNumber(x.finalizationBlockNumber);
  }
  if (x.finalizationTime !== null && x.finalizationTime !== undefined) {
    mi.setFinalizationTime(x.finalizationTime);
  }
  if (x.lastTradeBlockNumber !== null && x.lastTradeBlockNumber !== undefined) {
    mi.setLastTradeBlockNumber(x.lastTradeBlockNumber);
  }
  if (x.lastTradeTime !== null && x.lastTradeTime !== undefined) {
    mi.setLastTradeTime(x.lastTradeTime);
  }
  if (x.reportingState !== null && x.reportingState !== undefined) {
    mi.setReportingState(reportingStateToProto(x.reportingState));
  }
  mi.setForking(x.forking !== 0); // forking is stored in DB as a boolean, but sqlite uses 0 and 1 as boolean, and this leaks into `UIMarketInfo.forking: number` instead of a bool; but we model forking as a bool in protobuf.
  mi.setNeedsMigration(x.needsMigration !== 0); // same as forking, convert sqlite3 bool-number into a bool
  mi.setDescription(x.description);
  if (x.details !== null && x.details !== undefined) {
    mi.setDetails(x.details);
  }
  if (x.scalarDenomination !== null && x.scalarDenomination !== undefined) {
    mi.setScalarDenomination(x.scalarDenomination);
  }
  mi.setDesignatedReporter(x.designatedReporter);
  mi.setDesignatedReportStake(x.designatedReportStake);
  if (x.resolutionSource !== null && x.resolutionSource !== undefined) {
    mi.setResolutionSource(x.resolutionSource);
  }
  mi.setNumTicks(x.numTicks);
  mi.setTickSize(x.tickSize);
  if (x.consensus !== null) {
    mi.setConsensus(normalizedPayoutToProto(x.consensus));
  }
  mi.setOutcomesList(x.outcomes.map(outcomeInfoToProto));
  return mi;
}

export function outcomeInfoToProto(x: UIOutcomeInfo<string>): OutcomeInfo {
  const o = new OutcomeInfo();
  o.setId(x.id);
  o.setVolume(x.volume);
  o.setPrice(x.price);
  if (x.description !== null) {
    o.setDescription(x.description);
  }
  return o;
}

export function normalizedPayoutToProto(x: NormalizedPayout<string>): NormalizedPayoutProto {
  const n = new NormalizedPayoutProto();
  // NormalizedPayout.isInvalid is of type `number | boolean`, but (in
  // design terms) it's just a bool, never a number: isInvalid is stored in
  // DB as a boolean, but sqlite uses 0 and 1 as boolean, and end result is
  // isInvalid might be a number; but we model isInvalid as a bool in protobuf.
  if (typeof x.isInvalid === "number") {
    n.setIsInvalid(x.isInvalid !== 0);
  } else {
    n.setIsInvalid(x.isInvalid);
  }
  n.setPayoutList(x.payout);
  return n;
}

export function reportingStateToProto(x: ReportingState): ReportingStateProto {
  switch (x) {
    case ReportingState.PRE_REPORTING:
      return ReportingStateProto.PRE_REPORTING;
    case ReportingState.DESIGNATED_REPORTING:
      return ReportingStateProto.DESIGNATED_REPORTING;
    case ReportingState.OPEN_REPORTING:
      return ReportingStateProto.OPEN_REPORTING;
    case ReportingState.CROWDSOURCING_DISPUTE:
      return ReportingStateProto.CROWDSOURCING_DISPUTE;
    case ReportingState.AWAITING_NEXT_WINDOW:
      return ReportingStateProto.AWAITING_NEXT_WINDOW;
    case ReportingState.AWAITING_FINALIZATION:
      return ReportingStateProto.AWAITING_FINALIZATION;
    case ReportingState.FINALIZED:
      return ReportingStateProto.FINALIZED;
    case ReportingState.FORKING:
      return ReportingStateProto.FORKING;
    case ReportingState.AWAITING_NO_REPORT_MIGRATION:
      return ReportingStateProto.AWAITING_NO_REPORT_MIGRATION;
    case ReportingState.AWAITING_FORK_MIGRATION:
      return ReportingStateProto.AWAITING_FORK_MIGRATION;
  }
}

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html
function getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];  // Inferred type is T[K]
}

// https://github.com/Microsoft/TypeScript/pull/12253#issuecomment-353494273
export function keys<O>(o: O) {
  return Object.keys(o) as Array<keyof O>;
}

export function marketPriceHistoryToProto(x: MarketPriceHistory<string>): MarketPriceHistoryProto {
  const o = new MarketPriceHistoryProto();
  // TODO can m be undefined? in the generated code getTimestampedPriceAmountByOutcomeMap takes opt_noLazyCreate, which seems to default to returning undefined if map doesn't already exist, however opt_noLazyCreate is not included in the TypeScript signature for some reason.
  const m = o.getTimestampedPriceAmountByOutcomeMap();
  keys(x).forEach((outcome) => {
    m.set(outcome, arrayOfTimestampedPriceAmountProtoToProto(x[outcome].map(timestampedPriceAmountToProto)));
  });
  return o;
}

export function timestampedPriceAmountToProto(x: TimestampedPriceAmount<string>): TimestampedPriceAmountProto {
  const o = new TimestampedPriceAmountProto();
  o.setPrice(x.price);
  o.setAmount(x.amount);
  o.setTimestamp(x.timestamp);
  return o;
}

function arrayOfTimestampedPriceAmountProtoToProto(x: Array<TimestampedPriceAmountProto>): ListTimestampedPriceAmount {
  const o = new ListTimestampedPriceAmount();
  o.setTimestampedPriceAmountsList(x);
  return o;
}

// uiOrdersToProto is a big messy function (instead of separating each proto mesasge into its own function, as done elsewhere in this file) because these proto messages (subtypes of GetOrdersResponse) are only needed to model the nested map structure from UIOrders<string>. So we keep it all here; it's ugly but contained.
// TODO unit test
export function uiOrdersToProto(x: UIOrders<string>): GetOrdersResponse.OrdersByOrderIdByOrderTypeByOutcomeByMarketId {
  const o = new GetOrdersResponse.OrdersByOrderIdByOrderTypeByOutcomeByMarketId();
  const m = o.getOrdersByOrderIdByOrderTypeByOutcomeByMarketIdMap();
  keys(x).forEach((marketId: string) => {
    const o2 = new GetOrdersResponse.OrdersByOrderIdByOrderTypeByOutcome();
    m.set(marketId, o2);
    const m2 = o2.getOrdersByOrderIdByOrderTypeByOutcomeMap();
    keys(x[marketId]).forEach((outcome: number) => {
      const o3 = new GetOrdersResponse.OrdersByOrderIdByOrderType();
      m2.set(outcome, o3);
      // TODO remove this duplicate code for buy/sell
      if (x[marketId][outcome].hasOwnProperty("buy")) {
        const o4 = new GetOrdersResponse.OrdersByOrderId();
        o3.setBuyOrdersByOrderId(o4);
        const m4 = o4.getOrdersByOrderIdMap();
        // tslint:disable-next-line
        Object.keys(x[marketId][outcome]["buy"]).forEach((orderId) => {
          // tslint:disable-next-line
          m4.set(orderId, orderToProto(x[marketId][outcome]["buy"][orderId]));
        });
      }
      if (x[marketId][outcome].hasOwnProperty("sell")) {
        const o4 = new GetOrdersResponse.OrdersByOrderId();
        o3.setSellOrdersByOrderId(o4);
        const m4 = o4.getOrdersByOrderIdMap();
        // tslint:disable-next-line
        Object.keys(x[marketId][outcome]["sell"]).forEach((orderId) => {
          // tslint:disable-next-line
          m4.set(orderId, orderToProto(x[marketId][outcome]["sell"][orderId]));
        });
      }
    });
  });
  return o;
}

export function orderToProto(x: UIOrder<string>): OrderProto {
  const o = new OrderProto();
  o.setOrderId(x.orderId);
  o.setTransactionHash(x.transactionHash);
  o.setLogIndex(x.logIndex);
  o.setShareToken(x.shareToken);
  o.setOwner(x.owner);
  o.setCreationTime(x.creationTime);
  o.setCreationBlockNumber(x.creationBlockNumber);
  o.setOrderState(orderStateToProto(x.orderState));
  o.setPrice(x.price);
  o.setAmount(x.amount);
  o.setOriginalAmount(x.originalAmount);
  o.setFullPrecisionPrice(x.fullPrecisionPrice);
  o.setFullPrecisionAmount(x.fullPrecisionAmount);
  o.setOriginalFullPrecisionAmount(x.originalFullPrecisionAmount);
  o.setTokensEscrowed(x.tokensEscrowed);
  o.setSharesEscrowed(x.sharesEscrowed);
  if (x.canceledBlockNumber !== undefined) {
    const n = parseInt(x.canceledBlockNumber, 10);
    if (isNaN(n)) {
      console.warn(`orderToProto canceledBlockNumber was defined but not a number, orderId=${x.orderId}, canceledBlockNumber=${x.canceledBlockNumber}`);
    } else {
      o.setCanceledBlockNumber(n);
    }
  }
  if (x.canceledTransactionHash !== undefined) {
    o.setCanceledTransactionHash(x.canceledTransactionHash);
  }
  if (x.canceledTime !== undefined) {
    const n = parseInt(x.canceledTime, 10);
    if (isNaN(n)) {
      console.warn(`orderToProto canceledTime was defined but not a number, orderId=${x.orderId}, canceledTime=${x.canceledTime}`);
    } else {
      o.setCanceledTime(n);
    }
  }
  return o;
}

export function orderStateToProto(x: OrderState): OrderStateProto {
  switch (x) {
    case OrderState.ALL:
      return OrderStateProto.ALL;
    case OrderState.OPEN:
      return OrderStateProto.OPEN;
    case OrderState.FILLED:
      return OrderStateProto.FILLED;
    case OrderState.CANCELED:
      return OrderStateProto.CANCELED;
  }
}
