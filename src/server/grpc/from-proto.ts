import { OrderState as OrderStateProto, OrderType as OrderTypeProto } from "../../../build-proto/augurMarkets_pb";
import { OrderState } from "../../types";
import { AugurNodeOrderType } from "./augur-node-new-types";

export function orderStateFromProto(x: OrderStateProto): OrderState | null {
  switch (x) {
    case OrderStateProto.ORDER_STATE_UNDEFINED:
      return null;
    case OrderStateProto.ALL:
      return OrderState.ALL;
    case OrderStateProto.OPEN:
      return OrderState.OPEN;
    case OrderStateProto.FILLED:
      return OrderState.FILLED;
    case OrderStateProto.CANCELED:
      return OrderState.CANCELED;
  }
}

export function orderTypeFromProto(x: OrderTypeProto): AugurNodeOrderType | null {
  switch (x) {
    case OrderTypeProto.ORDER_TYPE_UNDEFINED:
      return null;
    case OrderTypeProto.BUY:
      return "buy";
    case OrderTypeProto.SELL:
      return "sell";
  }
}
