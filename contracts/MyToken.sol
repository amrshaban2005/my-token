pragma solidity >=0.4.22 <0.7.0;

contract MyToken{
    
    string public name="My Token";
    string public symbol="Tok";
    uint256 public totalSupply;
    
    mapping(address=>uint256) public balanceOf;
    mapping(address=>mapping(address=>uint256)) public allowance;
    
    event Transfer(address indexed   _from,address indexed  _to,uint256 _value);
    
    event Approval(address indexed  _owner,address indexed  _spender,uint256 _value);
     
    
    constructor (uint256 _initialSupply) public{
        totalSupply=_initialSupply;
        balanceOf[msg.sender]=totalSupply;
    }
    
    function transfer(address _to, uint256 _value) public returns (bool success){
        require(balanceOf[msg.sender]>=_value);
        
        balanceOf[msg.sender]-=_value;
        balanceOf[_to]+=_value;
        
        emit Transfer(msg.sender,_to,_value);
        return true;
        
    }
    
    // approve another account B to spend value from my account A 
    function approve(address _spender,uint256 _value) public returns (bool success){
        allowance[msg.sender][_spender]=_value;
        emit Approval(msg.sender,_spender,_value);
        return true;
    }
    
    // spend value as a spender account B from account A to any account C 
    function transferFrom(address _from,address _to,uint256 _value)public returns(bool success){
        require(balanceOf[_from]>=_value);
        require(allowance[_from][msg.sender]>=_value);
        
        balanceOf[_from]-=_value;
        balanceOf[_to]+=_value;
        
        allowance[_from][msg.sender]-=_value;
        
        emit Transfer(_from,_to,_value);
        return true;
        
    }
        
        
    
    
}