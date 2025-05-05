import assert from "assert";
import { 
  TestHelpers,
  KuruOrderBook_Trade
} from "generated";
const { MockDb, KuruOrderBook } = TestHelpers;

describe("Kuru contract Trade event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for Kuru contract Trade event
  const event = KuruOrderBook.Trade.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("Kuru_Trade is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await KuruOrderBook.Trade.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualKuruTrade = mockDbUpdated.entities.KuruOrderBook_Trade.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedKuruTrade: KuruOrderBook_Trade = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      blockHeight: event.block.number,
      transactionHash: event.transaction.hash,
      orderBookAddress: event.srcAddress,
      orderId: event.params.orderId,
      makerAddress: event.params.makerAddress,
      isBuy: event.params.isBuy,
      price: event.params.price,
      updatedSize: event.params.updatedSize,
      takerAddress: event.params.takerAddress,
      txOrigin: event.params.txOrigin,
      filledSize: event.params.filledSize,
    };

    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualKuruTrade, expectedKuruTrade, "Actual KuruTrade should be the same as the expectedKuruTrade");
  });
});
