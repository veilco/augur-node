import Augur from "augur.js";
import { handleUnaryCall, sendUnaryData, Server, ServerCredentials, ServerUnaryCall, ServiceError, status } from "grpc";
import * as Knex from "knex";
import { IMarketsApiServer, MarketsApiService } from "../../../build-proto/augurMarkets_grpc_pb";
import { BulkGetMarketPriceHistoryRequest, BulkGetMarketPriceHistoryResponse, BulkGetOrdersRequest, BulkGetOrdersResponse, GetMarketPriceHistoryRequest, GetMarketPriceHistoryResponse, GetMarketsInfoRequest, GetMarketsInfoResponse, GetMarketsRequest, GetMarketsResponse, GetOrdersRequest, GetOrdersResponse } from "../../../build-proto/augurMarkets_pb";
import { Address, MarketPriceHistory, UIMarketsInfo, UIOrders } from "../../types";
import { getMarketPriceHistory } from "../getters/get-market-price-history";
import { getMarkets } from "../getters/get-markets";
import { getMarketsInfo } from "../getters/get-markets-info";
import { getOrders } from "../getters/get-orders";
import { marketInfoToProto, marketPriceHistoryToProto, uiOrdersToProto } from "./from-object";
import { orderStateFromProto, orderTypeFromProto } from "./from-proto";

// A note on concurrency/parallelism for Bulk gRPC apis: we could use Promise-based concurrency to take advantage of concurrency / pooling in Knex, however unsure if Knex/node uses non-blocking I/O, and also sqlite3 may throw concurrent/locking exceptions, especially in journaling mode (which augur-node uses), so we'll just have the whole thing be single threaded to minimize errors for now. https://knexjs.org/#Installation-pooling  https://stackoverflow.com/questions/4060772/sqlite-concurrent-access

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

function makeGetMarkets(db: Knex): handleUnaryCall<GetMarketsRequest, GetMarketsResponse> {
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
      undefinedIfEmpty(req.getSearch()),
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

function makeGetMarketsInfo(db: Knex): handleUnaryCall<GetMarketsInfoRequest, GetMarketsInfoResponse> {
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

function doGetMarketPriceHistory(db: Knex, req: GetMarketPriceHistoryRequest): Promise<GetMarketPriceHistoryResponse | ServiceError> {
  return new Promise((resolve, reject) => {
    try {
      getMarketPriceHistory(db,
        req.getMarketId(),
        undefinedIfEmpty(req.getSortBy()),
        req.getIsSortDescending(), // getMarketPriceHistory() allows for isSortDescending to be undefined, but it's never undefined in GetMarketsRequest. However, isSortDescending is ignored if sortBy is undefined.
        undefinedIfEmpty(req.getLimit()),
        (err: Error | null, result?: MarketPriceHistory<string>) => {
        if (err !== null) {
          const serviceErr: ServiceError = err;
          serviceErr.code = status.UNAVAILABLE;
          resolve(serviceErr);
        } else {
          const response = new GetMarketPriceHistoryResponse();
          if (!isNullOrUndefined(result)) {
            response.setMarketPriceHistory(marketPriceHistoryToProto(result));
          }
          resolve(response);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

function makeGetMarketPriceHistory(db: Knex): handleUnaryCall<GetMarketPriceHistoryRequest, GetMarketPriceHistoryResponse> {
  const f: handleUnaryCall<GetMarketPriceHistoryRequest, GetMarketPriceHistoryResponse> = (
    call: ServerUnaryCall<GetMarketPriceHistoryRequest>,
    callback: sendUnaryData<GetMarketPriceHistoryResponse>) => {
    function onErr(err: any) {
      console.error("gRPC: getMarketPriceHistory error", err);
    }
    doGetMarketPriceHistory(db, call.request).then((respOrErr) => {
      if (respOrErr instanceof Error) {
        onErr(respOrErr);
        callback(respOrErr, null);
      } else {
        callback(null, respOrErr);
      }
    }).catch(onErr);
  };
  return f;
}

function makeBulkGetMarketPriceHistory(db: Knex): handleUnaryCall<BulkGetMarketPriceHistoryRequest, BulkGetMarketPriceHistoryResponse> {
  const f: handleUnaryCall<BulkGetMarketPriceHistoryRequest, BulkGetMarketPriceHistoryResponse> = (
    call: ServerUnaryCall<BulkGetMarketPriceHistoryRequest>,
    callback: sendUnaryData<BulkGetMarketPriceHistoryResponse>) => {
    (async () => {
      try {
        const resp = new BulkGetMarketPriceHistoryResponse();
        const respMap = resp.getResponsesByMarketIdMap();
        for (const req of call.request.getRequestsList()) {
          const respOrErr = await doGetMarketPriceHistory(db, req);
          if (respOrErr instanceof Error) {
            throw respOrErr; // short-circuit after one errored sub-request
          } else {
            respMap.set(req.getMarketId(), respOrErr);
          }
        }
        callback(null, resp);
      } catch (err) {
        console.error("gRPC: bulkGetMarketPriceHistory error", err);
        const sErr: ServiceError = err;
        sErr.code = status.UNAVAILABLE;
        callback(sErr, null);
      }
    })();
  };
  return f;
}

function doGetOrders(db: Knex, req: GetOrdersRequest): Promise<GetOrdersResponse | ServiceError> {
  return new Promise((resolve, reject) => {
    try {
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
        req.getOrphaned(),
        (err: Error | null, result?: UIOrders<string>) => {
          if (err !== null) {
            const sErr: ServiceError = err;
            sErr.code = status.UNAVAILABLE;
            resolve(sErr);
          } else {
            const resp = new GetOrdersResponse();
            if (!isNullOrUndefined(result)) {
              resp.setWrapper(uiOrdersToProto(result));
            }
            resolve(resp);
          }
        });
    } catch (err) {
      reject(err);
    }
  });
}

function makeGetOrders(db: Knex): handleUnaryCall<GetOrdersRequest, GetOrdersResponse> {
  const f: handleUnaryCall<GetOrdersRequest, GetOrdersResponse> = (
    call: ServerUnaryCall<GetOrdersRequest>,
    callback: sendUnaryData<GetOrdersResponse>): void => {
    function onErr(err: any) {
      console.error("gRPC: getOrders error", err);
    }
    doGetOrders(db, call.request).then((respOrErr) => {
      if (respOrErr instanceof Error) {
        onErr(respOrErr);
        callback(respOrErr, null);
      } else {
        callback(null, respOrErr);
      }
    }).catch(onErr);
  };
  return f;
}

function makeBulkGetOrders(db: Knex): handleUnaryCall<BulkGetOrdersRequest, BulkGetOrdersResponse> {
  const f: handleUnaryCall<BulkGetOrdersRequest, BulkGetOrdersResponse> = (
    call: ServerUnaryCall<BulkGetOrdersRequest>,
    callback: sendUnaryData<BulkGetOrdersResponse>) => {
    (async () => {
      try {
        const responses: Array<GetOrdersResponse> = [];
        for (const req of call.request.getRequestsList()) {
          const respOrErr = await doGetOrders(db, req);
          if (respOrErr instanceof Error) {
            throw respOrErr; // short-circuit after one errored sub-request
          } else {
            responses.push(respOrErr);
          }
        }
        const resp = new BulkGetOrdersResponse();
        resp.setResponsesList(responses);
        callback(null, resp);
      } catch (err) {
        console.error("gRPC: bulkGetOrders error", err);
        const sErr: ServiceError = err;
        sErr.code = status.UNAVAILABLE;
        callback(sErr, null);
      }
    })();
  };
  return f;
}

function makeMarketService(db: Knex, augur: Augur): IMarketsApiServer {
  return {
    getMarkets: makeGetMarkets(db),
    getMarketsInfo: makeGetMarketsInfo(db),
    getMarketPriceHistory: makeGetMarketPriceHistory(db),
    bulkGetMarketPriceHistory: makeBulkGetMarketPriceHistory(db),
    getOrders: makeGetOrders(db),
    bulkGetOrders: makeBulkGetOrders(db),
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
