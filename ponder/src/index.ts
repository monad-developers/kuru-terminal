import { v4 as uuidv4 } from 'uuid';
import { ponder } from "ponder:registry";
import { trade } from "ponder:schema";

ponder.on("KuruOrderBookAbi:Trade", async ({ event, context }) => {
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
    const blockHeight = event.block.number;
    const orderBookAddress = event.log.address;

    const id = uuidv4();
    await context.db.insert(trade).values({
        id,
        orderId: BigInt(orderId),
        txOrigin,
        makerAddress,
        takerAddress,
        isBuy,
        price: BigInt(price),
        updatedSize: BigInt(updatedSize),
        filledSize: BigInt(filledSize),
        blockHeight: BigInt(blockHeight),
        orderBookAddress
    })
})
