
// TODO make it enum instead?

export type AugurNodeOrderType = "buy" | "sell"; // augur-node declares no type OrderType, just uses a string, but in the database there's a constraint to check that the orderType string is either "buy" or "sell".

const types: Array<AugurNodeOrderType> = ["buy", "sell"];
export const AugurNodeOrderTypes: ReadonlyArray<string> = Object.freeze(types);
