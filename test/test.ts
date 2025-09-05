import assert from "assert";
import { TestHelpers, Account } from "generated";
const { MockDb, ClassicVaultFactory, ContractDeployer, Addresses } = TestHelpers;

describe("Beefy Contracts", () => {
  it("ProxyCreated event creates token and statistics", async () => {
    //Instantiate a mock DB
    const mockDbEmpty = MockDb.createMockDb();

    //Get mock addresses from helpers
    const userAddress1 = Addresses.mockAddresses[0];
    const userAddress2 = Addresses.mockAddresses[1];

    //Make a mock entity to set the initial state of the mock db
    const mockAccountEntity: Account = {
      id: userAddress1,
    };

    //Set an initial state for the user
    //Note: set and delete functions do not mutate the mockDb, they return a new
    //mockDb with with modified state
    const mockDb = mockDbEmpty.entities.Account.set(mockAccountEntity);

    //Create a mock ProxyCreated event 
    const mockProxyCreated = ClassicVaultFactory.ProxyCreated.createMockEvent({
      _0: userAddress2, // proxy address
    });

    //Process the mockEvent
    //Note: processEvent functions do not mutate the mockDb, they return a new
    //mockDb with with modified state
    const mockDbAfterEvent = await ClassicVaultFactory.ProxyCreated.processEvent({
      event: mockProxyCreated,
      mockDb,
    });

    //Check that the token was created
    const token = mockDbAfterEvent.entities.Token.get(userAddress2);

    //Assert the token was created
    assert(token, "Token should have been created");
    assert.equal(token.id, userAddress2, "Token ID should match proxy address");

    //Check that token statistics were created
    const tokenStats = mockDbAfterEvent.entities.TokenStatistic.get(userAddress2);
    assert(tokenStats, "Token statistics should have been created");
    assert.equal(tokenStats.totalSupply, 0n, "Initial total supply should be 0");
  });
});
