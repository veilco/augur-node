import { credentials } from 'grpc';
import { MarketsApiClient } from '../../../build-proto/markets_grpc_pb';
import { GRPCServerConfig } from './grpc-server';

// NewGRPCClient provided as an example and is
// not a dependency of augur-node's gRPC server.
export function NewGRPCClient(config: GRPCServerConfig): MarketsApiClient {
  const client = new MarketsApiClient(config.bindAddress, credentials.createInsecure());
  return client;
}
