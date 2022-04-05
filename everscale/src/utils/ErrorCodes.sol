pragma ton-solidity >=0.43.0;
pragma AbiHeader expire;


library ErrorCodes {

    // Access
    uint16 constant NOT_OWNER = 1101;
    uint16 constant ZERO_OWNER = 1102;

    // Utils
    // - CheckPubKey
    uint16 constant DIFFERENT_PUB_KEYS = 1103;

    // Bridge
    uint16 constant SENDER_NOT_STAKING = 2107;
    uint16 constant SENDER_NOT_RELAY_ROUND = 2110;

    // Event configuration contract
    uint16 constant EVENT_BLOCK_NUMBER_LESS_THAN_START = 2210;
    uint16 constant EVENT_TIMESTAMP_LESS_THAN_START = 2211;
    uint16 constant SENDER_NOT_EVENT_CONTRACT = 2212;
    uint16 constant TOO_LOW_DEPLOY_VALUE = 2213;
    uint16 constant EVENT_BLOCK_NUMBER_HIGHER_THAN_END = 2214;
    uint16 constant EVENT_TIMESTAMP_HIGHER_THAN_END = 2215;
    uint16 constant TOO_LOW_END_BLOCK_NUMBER = 2217;
    uint16 constant END_BLOCK_NUMBER_ALREADY_SET = 2219;
    uint16 constant SENDER_IS_NOT_EVENT_EMITTER = 2220;

    // Event contract
    uint16 constant EVENT_NOT_PENDING = 2312;
    uint16 constant SENDER_NOT_EVENT_CONFIGURATION = 2313;
    uint16 constant KEY_VOTE_NOT_EMPTY = 2318;
    uint16 constant SENDER_NOT_INITIALIZER = 2319;
    uint16 constant EVENT_NOT_INITIALIZING = 2321;
    uint16 constant WRONG_VOTE_RECEIVER = 2323;

    // staking
    uint16 constant NOT_RELAY_ROUND = 2515;

    // Proxy Token Transfer
    uint16 constant NOT_ETHEREUM_CONFIG = 2701;

}
