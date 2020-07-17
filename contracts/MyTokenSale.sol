pragma solidity >=0.4.22 <0.7.0;

import './MyToken.sol';

contract MyTokenSale{
    
    address payable admin;
    MyToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;
    
    event Sell(address _buyer,uint256 _amount);
    
    constructor (MyToken _toekenContract,uint256 _tokenPrice) public{
        admin=msg.sender;
        tokenContract=_toekenContract;
        tokenPrice=_tokenPrice;
    }
    
     function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }
    
    function buyTokens(uint256 _numberOfToken) public payable{
        require (msg.value ==multiply( _numberOfToken, tokenPrice));
        
        require(tokenContract.balanceOf(address(this))>=_numberOfToken);
       
        
        require(tokenContract.transfer(msg.sender,_numberOfToken));
        tokenSold+=_numberOfToken;
        emit Sell(msg.sender,_numberOfToken);
    }
    
    function endSale() public{
        require(msg.sender==admin);
        require(tokenContract.transfer(admin,tokenContract.balanceOf(address(this))));
        admin.transfer(address(this).balance);
        
    }
    
    
    
    
    
}