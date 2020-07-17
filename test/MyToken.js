const MyToken = artifacts.require("MyToken");


contract('MyToken', (accounts) => {
    var tokenInstance;
    //initilize the contract
    it('initilize the contract with the default values', async () => {
        tokenInstance = await MyToken.deployed();
        //check name
        const name = await tokenInstance.name();
        assert.equal('My Token', name);
        //checl symbol
        const symbol = await tokenInstance.symbol();
        assert.equal('Tok', symbol);
    });

    //check initlize totalSupply and balance of admin account
    it('initlize totalSupply at deployment and for admin accout', async () => {
        tokenInstance = await MyToken.deployed();
        //check totalsupply
        const totalSupply = await tokenInstance.totalSupply();
        assert.equal(1000000, totalSupply.toNumber());
        //check balance of admin account
        const balance = await tokenInstance.balanceOf(accounts[0]);
        assert.equal(1000000, balance.toNumber())
    });

    //transfer with value greater than balance
    it('transfer token', async () => {
        tokenInstance = await MyToken.deployed();
        // check if token value greater than balance
        try {
            await tokenInstance.transfer.call(accounts[1], 10000000000);
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0);
        }
        //check return true
        let success = await tokenInstance.transfer.call(accounts[1], 250000);
        assert.equal(success, true);
        //check trigger event
        let receipt = await tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        assert.equal(receipt.logs.length, 1);
        assert.equal(receipt.logs[0].event, 'Transfer');
        assert.equal(receipt.logs[0].args._from, accounts[0]);
        assert.equal(receipt.logs[0].args._to, accounts[1]);
        assert.equal(receipt.logs[0].args._value, 250000);
        //check balance
        let balance = await tokenInstance.balanceOf(accounts[1]);
        assert.equal(250000, balance.toNumber());
        balance = await tokenInstance.balanceOf(accounts[0]);
        assert.equal(750000, balance.toNumber());
    });



    // approve - check allownance
    // revieve event Approval
    it('Approve spend', async () => {
        tokenInstance = await MyToken.deployed();
        //check return true
        let success = await tokenInstance.approve.call(accounts[1], 1000);
        assert.equal(success, true);
        //check trigger event
        let receipt = await tokenInstance.approve(accounts[1], 1000, { from: accounts[0] });
        assert.equal(receipt.logs.length, 1);
        assert.equal(receipt.logs[0].event, 'Approval');
        assert.equal(receipt.logs[0].args._owner, accounts[0]);
        assert.equal(receipt.logs[0].args._spender, accounts[1]);
        assert.equal(receipt.logs[0].args._value, 1000);
        //checl allowance
        let allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
        assert.equal(1000, allowance.toNumber());
    });

    // transfer from - check balance of from
    it('transfer from', async () => {
        tokenInstance = await MyToken.deployed();

        fromAccount = accounts[2];
        toAccount = accounts[3];
        spenderAccount = accounts[4];
        await tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
        await tokenInstance.approve(spenderAccount, 10, { from: fromAccount });
        //check if token value greater than balance
        try {
            await tokenInstance.transferFrom(fromAccount, toAccount, 200, { from: spenderAccount });
        } catch (error) {
            //assert.fail('token value greater than balance');
            assert(error.message.indexOf('revert') >= 0);
        }
        // check if token value greater than allowance
        try {
            await tokenInstance.transferFrom(fromAccount, toAccount, 100, { from: spenderAccount });
        } catch (error) {
            //assert.fail('token value greater than allowance');
            assert(error.message.indexOf('revert') >= 0);
        }
        //check return true
        let success = await tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spenderAccount });
        assert.equal(true, success);
        //checl fire event
        let receipt = await tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spenderAccount });
        assert.equal(receipt.logs.length, 1);
        assert.equal(receipt.logs[0].event, 'Transfer');
        assert.equal(receipt.logs[0].args._from, fromAccount);
        assert.equal(receipt.logs[0].args._to, toAccount);
        assert.equal(receipt.logs[0].args._value, 10);
        //check balance
        let balance = await tokenInstance.balanceOf(fromAccount);
        assert.equal(90, balance.toNumber(), 'deduct from _from account balanace');
        balance = await tokenInstance.balanceOf(toAccount);
        assert.equal(10, balance.toNumber(), 'send to _to account balanace');
        //checl allowance
        let allowance = await tokenInstance.allowance(fromAccount, spenderAccount);
        assert.equal(0, allowance.toNumber(), 'deduct from allownce balanace');
    });



});