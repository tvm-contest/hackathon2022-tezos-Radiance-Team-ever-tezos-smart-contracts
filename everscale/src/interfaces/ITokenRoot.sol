pragma ton-solidity >= 0.43.0;

interface ITokenRoot {
    function transferToken(
        address gasTo,
        address addrRecipient,
        uint128 amount
    ) external;

    function burnToken(
        uint128 amount,
        TvmCell payload
    ) external;
}
