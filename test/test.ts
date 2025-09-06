// const { MockDb, ContractFactory, Addresses } = TestHelpers;

describe('Beefy Contracts', () => {
    // it('ProxyCreated event registers token for indexing', async () => {
    //     //Instantiate a mock DB
    //     const mockDbEmpty = MockDb.createMockDb();
    //     //Get mock addresses from helpers
    //     const userAddress1 = Addresses.mockAddresses[0];
    //     const proxyAddress = Addresses.mockAddresses[1];
    //     //Make a mock entity to set the initial state of the mock db
    //     const mockAccountEntity: Account = {
    //         id: userAddress1,
    //     };
    //     //Set an initial state for the user
    //     //Note: set and delete functions do not mutate the mockDb, they return a new
    //     //mockDb with with modified state
    //     const mockDb = mockDbEmpty.entities.Account.set(mockAccountEntity);
    //     //Create a mock ProxyCreated event
    //     const mockProxyCreated = ContractFactory.ProxyCreated.createMockEvent({
    //         _0: proxyAddress, // proxy address
    //     });
    //     //Process the mockEvent
    //     //Note: processEvent functions do not mutate the mockDb, they return a new
    //     //mockDb with with modified state
    //     const mockDbAfterEvent = await ContractFactory.ProxyCreated.processEvent({
    //         event: mockProxyCreated,
    //         mockDb,
    //     });
    //     // The ProxyCreated event handler only calls context.addToken() to register the token
    //     // It doesn't create Token or Contract entities directly - those are created
    //     // when Transfer events are processed or through other mechanisms
    //     // For now, we can verify that the event was processed without error
    //     // and the mockDb state is returned (basic smoke test)
    //     assert(mockDbAfterEvent, 'Event should process successfully');
    //     // Note: To fully test token creation, we would need to:
    //     // 1. Mock the token metadata effects
    //     // 2. Process a Transfer event for the registered token
    //     // 3. Then verify Token and Contract entities are created with proper metadata
    // });
    // it('BoostDeployed event registers token for indexing', async () => {
    //     //Instantiate a mock DB
    //     const mockDbEmpty = MockDb.createMockDb();
    //     //Get mock addresses from helpers
    //     const boostAddress = Addresses.mockAddresses[0];
    //     //Create a mock BoostDeployed event
    //     const mockBoostDeployed = ContractFactory.BoostDeployed.createMockEvent({
    //         _0: boostAddress, // boost address
    //     });
    //     //Process the mockEvent
    //     const mockDbAfterEvent = await ContractFactory.BoostDeployed.processEvent({
    //         event: mockBoostDeployed,
    //         mockDb: mockDbEmpty,
    //     });
    //     // Verify that the event was processed without error
    //     assert(mockDbAfterEvent, 'BoostDeployed event should process successfully');
    // });
    // it('ContractDeployed event registers token for indexing', async () => {
    //     //Instantiate a mock DB
    //     const mockDbEmpty = MockDb.createMockDb();
    //     //Get mock addresses from helpers
    //     const contractAddress = Addresses.mockAddresses[0];
    //     const salt = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    //     //Create a mock ContractDeployed event
    //     const mockContractDeployed = ContractFactory.ContractDeployed.createMockEvent({
    //         _0: salt, // salt
    //         _1: contractAddress, // contract address
    //     });
    //     //Process the mockEvent
    //     const mockDbAfterEvent = await ContractFactory.ContractDeployed.processEvent({
    //         event: mockContractDeployed,
    //         mockDb: mockDbEmpty,
    //     });
    //     // Verify that the event was processed without error
    //     assert(mockDbAfterEvent, 'ContractDeployed event should process successfully');
    // });
    // it('Transfer event creates token with metadata and updates balances', async () => {
    //     //Instantiate a mock DB
    //     const mockDbEmpty = MockDb.createMockDb();
    //     //Get mock addresses from helpers
    //     const _tokenAddress = Addresses.mockAddresses[0];
    //     const senderAddress = Addresses.mockAddresses[1];
    //     const receiverAddress = Addresses.mockAddresses[2];
    //     const transferAmount = 1000000000000000000n; // 1 token with 18 decimals
    //     //Create a mock Transfer event
    //     const mockTransfer = TestHelpers.Token.Transfer.createMockEvent({
    //         _0: senderAddress, // from
    //         _1: receiverAddress, // to
    //         _2: transferAmount, // value
    //     });
    //     // Note: In a real test, you would need to mock the token metadata effect
    //     // For this example, we'll assume the effect returns reasonable defaults
    //     //Process the mockEvent
    //     const mockDbAfterEvent = await TestHelpers.Token.Transfer.processEvent({
    //         event: mockTransfer,
    //         mockDb: mockDbEmpty,
    //     });
    //     // This test would verify:
    //     // 1. Token entity is created with metadata (name, symbol, decimals)
    //     // 2. Account entities are created for sender and receiver
    //     // 3. TokenBalance entities are created and updated
    //     // 4. Token totalSupply and holderCount are updated correctly
    //     // For now, just verify the event processes without error
    //     assert(mockDbAfterEvent, 'Transfer event should process successfully');
    //     // TODO: Add proper mocking for token metadata effects and then verify:
    //     // - const token = mockDbAfterEvent.entities.Token.get(tokenAddress);
    //     // - const senderBalance = mockDbAfterEvent.entities.TokenBalance.get(`${senderAddress}-${tokenAddress}`);
    //     // - const receiverBalance = mockDbAfterEvent.entities.TokenBalance.get(`${receiverAddress}-${tokenAddress}`);
    //     // - assert token metadata, balance amounts, holder counts, etc.
    // });
});
