pragma ton-solidity >= 0.43.0;

interface ITezosEvent {
    struct TezosEventVoteData {
        uint32 eventID;
        bytes eventBlockHash;
        TvmCell eventData;
        bytes eventTransactionHash;
    }

    struct TezosEventInitData {
        TezosEventVoteData voteData;
        address configuration;
        uint32 chainId;
        address bridge;
    }
}
