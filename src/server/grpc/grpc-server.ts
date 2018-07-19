import Augur from "augur.js";
import { handleCall, handleUnaryCall, sendUnaryData, Server, ServerCredentials, ServerUnaryCall, ServiceError, status } from "grpc";
import * as Knex from "knex";
import { MarketsApiService, IMarketsApiServer } from "../../../build-proto/augurMarkets_grpc_pb";
import { GetMarketsInfoRequest, GetMarketsInfoResponse, GetMarketsRequest, GetMarketsResponse, GetMarketPriceHistoryRequest, GetMarketPriceHistoryResponse, GetOrdersRequest, GetOrdersResponse } from "../../../build-proto/augurMarkets_pb";
import { Address, UIMarketsInfo, MarketPriceHistory, UIOrders } from "../../types";
import { getMarkets } from "../getters/get-markets";
import { getMarketsInfo } from "../getters/get-markets-info";
import { marketInfoToProto, marketPriceHistoryToProto, uiOrdersToProto } from "./from-object";
import { getMarketPriceHistory } from "../getters/get-market-price-history";
import { getOrders } from "../getters/get-orders";
import { orderStateFromProto, orderTypeFromProto } from "./from-proto";

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

// nullIfEmpty exists for the same reason as undefinedIfEmpty, except sometimes null is required instead of undefined.
function nullIfEmpty<T extends string | number>(v: T): T | null {
  const o = undefinedIfEmpty(v);
  if (o === undefined) {
    return null;
  }
  return o;
}

function makeGetMarkets(db: Knex): handleCall<GetMarketsRequest, GetMarketsResponse> {
  const f: handleUnaryCall<GetMarketsRequest, GetMarketsResponse> = (
    call: ServerUnaryCall<GetMarketsRequest>,
    callback: sendUnaryData<GetMarketsResponse>): void => {
    const req = call.request;
    if (req.getUniverse() === "") {
      const sErr: ServiceError = new Error("universe Address was empty, but is required");
      sErr.code = status.INVALID_ARGUMENT;
      callback(sErr, null);
      return;
    }
    getMarkets(
      db,
      req.getUniverse(),
      undefinedIfEmpty(req.getCreator()),
      undefinedIfEmpty(req.getCategory()),
      undefinedIfEmpty(req.getReportingState()),
      undefinedIfEmpty(req.getFeeWindow()),
      undefinedIfEmpty(req.getDesignatedReporter()),
      undefinedIfEmpty(req.getSortBy()),
      req.getIsSortDescending(), // getMarkets() allows for isSortDescending to be undefined, but it's never undefined in GetMarketsRequest. This causes isSortDescending to be respected even if sortBy is undefined: isSortDescending will be used to determine if the default sort order is descending. Note that augur-node code always enforces some default sort order, so the fact that this is never undefined is not a performance bug per se (at this layer).
      undefinedIfEmpty(req.getLimit()),
      undefinedIfEmpty(req.getOffset()),
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
        const resp = new GetMarketsInfoResponse();
        if (!isNullOrUndefined(result)) {
          resp.setMarketInfoList(result.map(marketInfoToProto));
        }
        callback(null, resp);
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
        const resp = new GetMarketPriceHistoryResponse();
        if (!isNullOrUndefined(result)) {
          resp.setMarketPriceHistory(marketPriceHistoryToProto(result));
        }
        callback(null, resp);
      }
    });
  };
  return f;
}

function makeGetOrders(db: Knex): handleCall<GetOrdersRequest, GetOrdersResponse> {
  const f: handleUnaryCall<GetOrdersRequest, GetOrdersResponse> = (
    call: ServerUnaryCall<GetOrdersRequest>,
    callback: sendUnaryData<GetOrdersResponse>): void => {
    const req = call.request;
    getOrders(
      db,
      nullIfEmpty(req.getUniverse()),
      nullIfEmpty(req.getMarketId()),
      nullIfEmpty(req.getOutcome()),
      orderTypeFromProto(req.getOrderType()),
      nullIfEmpty(req.getCreator()),
      orderStateFromProto(req.getOrderState()),
      nullIfEmpty(req.getEarliestCreationTime()),
      nullIfEmpty(req.getLatestCreationTime()),
      undefinedIfEmpty(req.getSortBy()),
      req.getIsSortDescending(), // getOrders() allows for isSortDescending to be undefined, but it's never undefined in GetOrdersRequest. This causes isSortDescending to be respected even if sortBy is undefined: isSortDescending will be used to determine if the default sort order is descending. Note that augur-node code always enforces some default sort order, so the fact that this is never undefined is not a performance bug per se (at this layer).
      undefinedIfEmpty(req.getLimit()),
      undefinedIfEmpty(req.getOffset()),
      (err: Error | null, result?: UIOrders<string>) => {
        if (err !== null) {
          console.error("gRPC: getOrders error", err);
          const sErr: ServiceError = err;
          sErr.code = status.UNAVAILABLE;
          callback(sErr, null);
        } else {
          const resp = new GetOrdersResponse();
          if (!isNullOrUndefined(result)) {
            resp.setWrapper(uiOrdersToProto(result));
          }
          callback(null, resp);
        }
      });
  };
  return f;
}

function makeMarketService(db: Knex, augur: Augur): object /*  TODO IMarketsApiServer */ {
  return {
    getMarkets: makeGetMarkets(db),
    getMarketsInfo: makeGetMarketsInfo(db),
    getMarketPriceHistory: makeGetMarketPriceHistory(db),
    getOrders: makeGetOrders(db),
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
