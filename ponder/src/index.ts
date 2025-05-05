import { v4 as uuidv4 } from 'uuid';
import { ponder } from "ponder:registry";
import { trade } from "ponder:schema";

/**
 * Event handler for KuruOrderBook Trade events
 * Currently processes Trade events only
 * 
 * Note: To add handlers for more events:
 * 1. Import new table from ponder:schema
 * 2. Add new event handler using ponder.on()
 * 3. Map event args to table fields
 * 4. Update ponder.config.ts to include the new event filter
 */
ponder.on("KuruOrderBookAbi:Trade", async ({ event, context }) => {
    const id = uuidv4();
    const txHash = event.transaction.hash;
    const blockHeight = event.block.number;
    const orderBookAddress = event.log.address;
    const {
        orderId,
        txOrigin,
        makerAddress,
        takerAddress,
        isBuy,
        price,
        updatedSize,
        filledSize
    } = event.args;

    await context.db.insert(trade).values({
        id,
        txHash,
        blockHeight: BigInt(blockHeight),
        orderBookAddress,
        orderId: BigInt(orderId),
        txOrigin,
        makerAddress,
        takerAddress,
        isBuy,
        price: BigInt(price),
        updatedSize: BigInt(updatedSize),
        filledSize: BigInt(filledSize),
    })
})
