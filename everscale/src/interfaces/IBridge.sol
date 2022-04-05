pragma ton-solidity >= 0.39.0;


interface IBridge {
    function getRelayKeys() external responsible view returns(uint[] _keys);
}
