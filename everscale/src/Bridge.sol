pragma ton-solidity >=0.43.0;

pragma AbiHeader expire;
pragma AbiHeader time;

import './interfaces/IBridge.sol';

contract Bridge is IBridge {

    address public _owner;
    address[] public _configurations;
    uint[] public _keys;

    constructor(address owner) public {
        tvm.accept();
        _owner = owner;
    }

    function setConfigurations(address[] configurations) public {
        require(msg.sender == _owner);

        _configurations = configurations;

        msg.sender.transfer({value:0, flag:64});
    }

    function setKeys(uint[] keys) public {
        require(msg.sender == _owner);

        _keys = keys;

        msg.sender.transfer({value:0, flag:64});
    }

    //todo return value
    function getRelayKeys() public override responsible view returns(uint[] keys) {
        return {value: 0, flag: 64} _keys;
    }

    function getInfo() public view returns (
        address owner,
        address[] configurations,
        uint[] keys
    ){
        return (_owner, _configurations, _keys);
    }

}