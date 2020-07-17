const MyToken = artifacts.require("MyToken");
const MyTokenSale = artifacts.require("MyTokenSale");

module.exports = async function (deployer) {
    await deployer.deploy(MyToken, 1000000);
    let tokenPrice = 1000000000000000; 
    await deployer.deploy(MyTokenSale, MyToken.address, tokenPrice);
};
