pragma ton-solidity >= 0.43.0;

interface ITIP3TokenRoot {
    function mint(
        uint128 amount,
        address recipient,
        uint128 deployWalletValue,
        address remainingGasTo,
        bool notify,
        TvmCell payload
    ) external;
}
