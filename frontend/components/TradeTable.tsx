import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Trade } from "@/types/trade.interface";

function TradeTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Filled Size</TableHead>
            <TableHead>Maker</TableHead>
            <TableHead>Taker</TableHead>
            <TableHead>Block Height</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 8 }).map((_, j) => (
                <TableCell key={j}>
                  <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

function formatBigInt(value: string): string {
  try {
    const num = BigInt(value);
    return num.toLocaleString();
  } catch (e) {
    return value;
  }
}

interface TradeTableProps {
  trades: Trade[];
  isLoading?: boolean;
}

const TradeTable = ({ trades, isLoading = false }: TradeTableProps) => {
  if (isLoading) {
    return <TradeTableSkeleton />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Filled Size</TableHead>
            <TableHead>Maker</TableHead>
            <TableHead>Taker</TableHead>
            <TableHead>Block Height</TableHead>
            <TableHead>Transaction Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No trades found.
              </TableCell>
            </TableRow>
          ) : (
            trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell className="font-medium">
                  {truncate(trade.id, 8)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={trade.isBuy ? "secondary" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {trade.isBuy ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {trade.isBuy ? "Buy" : "Sell"}
                  </Badge>
                </TableCell>
                <TableCell>{formatBigInt(trade.price ?? "0")}</TableCell>
                <TableCell>{formatBigInt(trade.filledSize ?? "0")}</TableCell>
                <TableCell className="font-mono text-xs">
                  {truncate(trade.makerAddress ?? "", 8)}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {truncate(trade.takerAddress ?? "", 8)}
                </TableCell>
                <TableCell>{trade.blockHeight}</TableCell>
                <TableCell>
                  <a href={`https://monad-testnet.socialscan.io/tx/${trade.transactionHash}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {truncate(trade.transactionHash ?? "", 8)}
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TradeTable;
