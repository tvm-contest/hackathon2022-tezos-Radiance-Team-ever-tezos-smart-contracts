pragma ton-solidity >= 0.43.0;


interface IBasicEventConfiguration {
    enum EventType { Tezos, Everscale }

    struct BasicConfiguration {
        address bridge;
        bytes eventABI;
        uint64 eventInitialBalance;
        TvmCell eventCode;
    }

    event NewEventContract(address eventContract);

    function getType() external pure responsible returns(EventType _type);
}
