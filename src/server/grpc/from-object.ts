import { MarketInfo, NormalizedPayout as NormalizedPayoutProto, OutcomeInfo, ReportingState as ReportingStateProto } from "../../../build-proto/augurMarkets_pb";
import { NormalizedPayout, ReportingState, UIMarketInfo, UIOutcomeInfo } from "../../types";

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
  mi.setOutstandingShares(x.outstandingShares);
  mi.setFeeWindow(x.feeWindow);
  mi.setEndTime(x.endTime);
  if (x.finalizationBlockNumber !== null && x.finalizationBlockNumber !== undefined) {
    mi.setFinalizationBlockNumber(x.finalizationBlockNumber);
  }
  if (x.finalizationTime !== null && x.finalizationTime !== undefined) {
    mi.setFinalizationTime(x.finalizationTime);
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
