pragma ton-solidity >= 0.43.0;

import "./IBasicEventConfiguration.sol";
import "./ITezosEvent.sol";


interface ITezosEventConfiguration is IBasicEventConfiguration {
    struct TezosEventConfiguration {
        uint32 chainId;
        uint160 eventEmitter;
        uint16 eventBlocksToConfirm;
        address proxy;
        uint32 startBlockNumber;
        uint32 endBlockNumber;
    }

    function deployEvent(
        ITezosEvent.TezosEventVoteData eventVoteData
    ) external;

    function deriveEventAddress(
        ITezosEvent.TezosEventVoteData eventVoteData
    ) external view responsible returns (address eventContract);

    function getDetails() external view responsible returns(
        BasicConfiguration _basicConfiguration,
        TezosEventConfiguration _networkConfiguration
    );

    function eventConfirmedCallback(
        ITezosEvent.TezosEventInitData eventInitData,
        address gasBackAddress
    ) external;
}
