import Augur from "augur.js";
import { handleCall, handleUnaryCall, sendUnaryData, Server, ServerCredentials, ServerUnaryCall, ServiceError, status } from "grpc";
import * as Knex from "knex";
import { MarketsApiService, IMarketsApiServer } from "../../../build-proto/augurMarkets_grpc_pb";
import { GetMarketsInfoRequest, GetMarketsInfoResponse, GetMarketsRequest, GetMarketsResponse, GetMarketPriceHistoryRequest, GetMarketPriceHistoryResponse } from "../../../build-proto/augurMarkets_pb";
import { Address, UIMarketsInfo, MarketPriceHistory } from "../../types";
import { getMarkets } from "../getters/get-markets";
import { getMarketsInfo } from "../getters/get-markets-info";
import { marketInfoToProto, marketPriceHistoryToProto } from "./from-object";
import { getMarketPriceHistory } from "../getters/get-market-price-history";

function isNullOrUndefined(value: any): value is null | undefined {
  return value === null || value === undefined;
}

// Why does undefinedIfEmpty exist? Because augur-node's getters API expects
// certain args to be undefined if they should be ignored. Errors may occur if these
// args are defined but empty (e.g. an error if universe filter is empty string).
function undefinedIfEmpty<T extends string | number>(v: T): T | undefined {
  if (typeof v === "number" && v !== 0) return v;
  if (typeof v === "string" && v.length > 0) return v;
  return undefined;
}

function makeGetMarkets(db: Knex): handleCall<GetMarketsRequest, GetMarketsResponse> {
  const f: handleUnaryCall<GetMarketsRequest, GetMarketsResponse> = (
    call: ServerUnaryCall<GetMarketsRequest>,
    callback: sendUnaryData<GetMarketsResponse>): void => {
    const r = call.request;
    if (r.getUniverse() === "") {
      const sErr: ServiceError = new Error("universe Address was empty, but is required");
      sErr.code = status.INVALID_ARGUMENT;
      callback(sErr, null);
      return;
    }
    getMarkets(
      db,
      r.getUniverse(),
      undefinedIfEmpty(r.getCreator()),
      undefinedIfEmpty(r.getCategory()),
      undefinedIfEmpty(r.getReportingState()),
      undefinedIfEmpty(r.getFeeWindow()),
      undefinedIfEmpty(r.getDesignatedReporter()),
      undefinedIfEmpty(r.getSortBy()),
      r.getIsSortDescending(), // getMarkets() allows for isSortDescending to be undefined, but it's never undefined in GetMarketsRequest. This causes isSortDescending to be respected even if sortBy is undefined: isSortDescending will be used to determine if the default sort order is descending.
      undefinedIfEmpty(r.getLimit()),
      undefinedIfEmpty(r.getOffset()),
      (err: Error | null, result?: Array<Address>) => {
        if (err !== null) {
          console.error("gRPC: getMarkets error", err);
          const sErr: ServiceError = err;
          sErr.code = status.UNAVAILABLE;
          callback(sErr, null);
        } else {
          const r = new GetMarketsResponse();
          if (!isNullOrUndefined(result)) {
            r.setMarketAddressesList(result);
          }
          callback(null, r);
        }
      });
  };
  return f;
}

function makeGetMarketsInfo(db: Knex): handleCall<GetMarketsInfoRequest, GetMarketsInfoResponse> {
  const f: handleUnaryCall<GetMarketsInfoRequest, GetMarketsInfoResponse> = (
    call: ServerUnaryCall<GetMarketsInfoRequest>,
    callback: sendUnaryData<GetMarketsInfoResponse>) => {
    getMarketsInfo(db, call.request.getMarketAddressesList(), (err: Error | null, result?: UIMarketsInfo<string>) => {
      if (err !== null) {
        console.error("gRPC: getMarketsInfo error", err);
        const sErr: ServiceError = err;
        sErr.code = status.UNAVAILABLE;
        callback(sErr, null);
      } else {
        const r = new GetMarketsInfoResponse();
        if (!isNullOrUndefined(result)) {
          r.setMarketInfoList(result.map(marketInfoToProto));
        }
        callback(null, r);
      }
    });
  };
  return f;
}

function makeGetMarketPriceHistory(db: Knex): handleCall<GetMarketPriceHistoryRequest, GetMarketPriceHistoryResponse> {
  const f: handleUnaryCall<GetMarketPriceHistoryRequest, GetMarketPriceHistoryResponse> = (
    call: ServerUnaryCall<GetMarketPriceHistoryRequest>,
    callback: sendUnaryData<GetMarketPriceHistoryResponse>) => {
    getMarketPriceHistory(db, call.request.getMarketId(), (err: Error | null, result?: MarketPriceHistory<string>) => {
      if (err !== null) {
        console.error("gRPC: getMarketPriceHistory error", err);
        const sErr: ServiceError = err;
        sErr.code = status.UNAVAILABLE;
        callback(sErr, null);
      } else {
        const r = new GetMarketPriceHistoryResponse();
        if (!isNullOrUndefined(result)) {
          r.setMarketPriceHistory(marketPriceHistoryToProto(result));
        }
        callback(null, r);
      }
    });
  };
  return f;
}

function makeMarketService(db: Knex, augur: Augur): object /* TODO IMarketsApiServer */ {
  return {
    getMarkets: makeGetMarkets(db),
    getMarketsInfo: makeGetMarketsInfo(db),
    getMarketPriceHistory: makeGetMarketPriceHistory(db),
  };
}

export interface GRPCServerConfig {
  bindAddress: string; // address to which server will bind, "ip:port"
}

export function GetDefaultGRPCServerConfig(): GRPCServerConfig {
  return {
    bindAddress: "0.0.0.0:50051",
  };
}

export function StartGRPCServer(config: GRPCServerConfig, db: Knex, augur: Augur): Server {
  const server = new Server();
  server.addService(MarketsApiService, makeMarketService(db, augur));
  server.bind(config.bindAddress, ServerCredentials.createInsecure());
  console.info("gRPC server listening on", config.bindAddress);
  server.start();
  return server;
}
