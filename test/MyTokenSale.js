const MyTokenSale = artifacts.require("MyTokenSale");
const MyToken = artifacts.require("MyToken");


contract('MyTokenSale', (accounts) => {
    var tokenSaleInstance;
    var tokenInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000;
    var tokenAvaliable = 750000;
    var numberofToken;

    //initilize the contract
    it('initilize the contract', async () => {
        tokenSaleInstance = await MyTokenSale.deployed();
        //check token sale contract address
        let address = await tokenSaleInstance.address;
        assert.notEqual(0x0, address, 'has contract address');
        //check token contract address
        address = await tokenSaleInstance.tokenContract();
        assert.notEqual(0x0, address, 'has token contract address');
        //check tokenPrice
        let price = await tokenSaleInstance.tokenPrice();
        assert.equal(price, tokenPrice, 'token price is correct');
    });

    //buy token
    it('buy token', async () => {
        tokenInstance = await MyToken.deployed();
        tokenSaleInstance = await MyTokenSale.deployed();
        tokenInstance.transfer(tokenSaleInstance.address, tokenAvaliable, { from: admin });
        //check number of token to buy greatet than contract token
        numberofToken = 850000
        try {
            await tokenSaleInstance.buyTokens.call(numberofToken, { from: buyer, value: numberofToken * tokenPrice });
        } catch (error) {
            //assert.fail('contract token out of balance');                
            assert(error.message.indexOf('revert') >= 0, 'number of token must less or equal contract token');
        }
        //check price of ether greater than the required to buy
        numberofToken = 10;
        try {
            await tokenSaleInstance.buyTokens.call(numberofToken, { from: buyer, value: 1 });
        } catch (error) {
            // assert.fail('msg.value must equal to num of token*tokenprice');
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal to num of token*tokenprice');
        }
        //check event
        let receipt = await tokenSaleInstance.buyTokens(numberofToken, { from: buyer, value: numberofToken * tokenPrice });
        assert.equal(receipt.logs.length, 1);
        assert.equal(receipt.logs[0].event, 'Sell');
        assert.equal(receipt.logs[0].args._buyer, buyer);
        assert.equal(receipt.logs[0].args._amount, numberofToken);
        //check token sold
        let tokenSold = await tokenSaleInstance.tokenSold();
        assert.equal(10, tokenSold, 'token sold is correct');
        //check token balance
        let balance = await tokenInstance.balanceOf(buyer);
        assert.equal(10, balance.toNumber(), 'balance of buyer is correct');
        balance = await tokenInstance.balanceOf(tokenSaleInstance.address);
        assert.equal(749990, balance.toNumber(), 'contract balance is correct');

    });

    // end sale
    it('End of sale', async () => {
        tokenInstance = await MyToken.deployed();
        tokenSaleInstance = await MyTokenSale.deployed();
        //check end of sale from buyer
        try {
            await tokenSaleInstance.endSale.call({ from: buyer });
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'admin required to end the sale');
        }
        await tokenSaleInstance.endSale({ from: admin });
        //check token balance
        let balance = await tokenInstance.balanceOf(admin);
        assert.equal(999990, balance.toNumber(), 'balance of admin is correct');
        balance = await tokenInstance.balanceOf(tokenSaleInstance.address);
        assert.equal(0, balance.toNumber(), 'contract balance is correct');
        //check contract ether balance
        balance = await web3.eth.getBalance(tokenSaleInstance.address);
        assert.equal(0, balance, 'contract has no ether balance');
    })
})