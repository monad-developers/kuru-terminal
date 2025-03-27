// Raw log type from Goldsky webhook
export interface RawLog {
  id: string;
  block_number: number;
  block_hash: string;
  transaction_hash: string;
  transaction_index: number;
  log_index: number;
  address: string;
  data: string;
  topics: string;
  block_timestamp: number;
}
