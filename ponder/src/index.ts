import { v4 as uuidv4 } from 'uuid';
import { ponder } from "ponder:registry";
import { trade } from "ponder:schema";

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
