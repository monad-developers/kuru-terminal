import assert from "assert";
import { 
  TestHelpers,
  KuruOrderBook_OrderCreated
} from "generated";
const { MockDb, KuruOrderBook } = TestHelpers;

describe("Kuru contract OrderCreated event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for Kuru contract OrderCreated event
  const event = KuruOrderBook.OrderCreated.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("Kuru_OrderCreated is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await KuruOrderBook.OrderCreated.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualKuruOrderCreated = mockDbUpdated.entities.KuruOrderBook_OrderCreated.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedKuruOrderCreated: KuruOrderBook_OrderCreated = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      blockHeight: event.block.number,
      transactionHash: event.transaction.hash,
      orderBookAddress: event.srcAddress,
      orderId: event.params.orderId,
      owner: event.params.owner,
      size: event.params.size,
      price: event.params.price,
      isBuy: event.params.isBuy,
    };

    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualKuruOrderCreated, expectedKuruOrderCreated, "Actual KuruOrderCreated should be the same as the expectedKuruOrderCreated");
  });
});
