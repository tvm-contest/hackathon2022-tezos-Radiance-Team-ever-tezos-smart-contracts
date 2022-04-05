pragma ton-solidity >= 0.43.0;

interface ITransferTokenProxy {
    function transferTokenCallback(TvmCell data) external;
    function burnTokenCallback(uint128 amount, TvmCell payload) external;
}
