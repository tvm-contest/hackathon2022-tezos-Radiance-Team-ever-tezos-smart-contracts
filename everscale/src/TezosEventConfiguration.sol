pragma ton-solidity >=0.43.0;
pragma AbiHeader expire;

import './interfaces/ITransferTokenProxy.sol';
import './interfaces/ITezosEvent.sol';
import './interfaces/ITezosEventConfiguration.sol';

import './TezosTransferTokenEvent.sol';

import './utils/ErrorCodes.sol';
import './utils/MsgFlag.sol';
import './utils/TransferUtils.sol';

contract TezosEventConfiguration is ITezosEventConfiguration, TransferUtils {

    address _owner;
    BasicConfiguration public _basicConfiguration;
    TezosEventConfiguration public _networkConfiguration;

    constructor(address owner, BasicConfiguration basicConfiguration, TezosEventConfiguration networkConfiguration) public {
        tvm.accept();
        _owner = owner;
        _basicConfiguration = basicConfiguration;
        _networkConfiguration = networkConfiguration;
    }

    modifier onlyOwner {
        require(msg.sender == _owner);
        _;
    }

    function setConfiguration(BasicConfiguration basicConfiguration, TezosEventConfiguration networkConfiguration) public onlyOwner {
        _basicConfiguration = basicConfiguration;
        _networkConfiguration = networkConfiguration;

        msg.sender.transfer({value:0, flag:64});
    }

    function buildEventInitData(
        ITezosEvent.TezosEventVoteData eventVoteData
    ) internal view returns(
        ITezosEvent.TezosEventInitData eventInitData
    ) {
        eventInitData.voteData = eventVoteData;
        eventInitData.configuration = address(this);
        eventInitData.chainId = _networkConfiguration.chainId;
        eventInitData.bridge = _basicConfiguration.bridge;
    }


    function deployEvent(
        ITezosEvent.TezosEventVoteData eventVoteData
    )
        external
        override
        reserveBalance
    {
        require(msg.value >= _basicConfiguration.eventInitialBalance, ErrorCodes.TOO_LOW_DEPLOY_VALUE);
        //todo add check
//        require(
//            eventVoteData.eventBlockNumber >= _networkConfiguration.startBlockNumber,
//            ErrorCodes.EVENT_BLOCK_NUMBER_LESS_THAN_START
//        );

//        if (_networkConfiguration.endBlockNumber != 0) {
//            require(
//                eventVoteData.eventBlockNumber <= _networkConfiguration.endBlockNumber,
//                ErrorCodes.EVENT_BLOCK_NUMBER_HIGHER_THAN_END
//            );
//        }

        ITezosEvent.TezosEventInitData eventInitData = buildEventInitData(eventVoteData);

        address eventContract = deriveEventAddress(eventVoteData);

        emit NewEventContract(eventContract);

        new TezosTransferTokenEvent{
            value: 0,
            flag: MsgFlag.ALL_NOT_RESERVED,
            code: _basicConfiguration.eventCode,
            pubkey: 0,
            varInit: {
                eventInitData: eventInitData
            }
        }(msg.sender);
    }

    function deriveEventAddress(
        ITezosEvent.TezosEventVoteData eventVoteData
    )
        override
        public
        view
        responsible
    returns(
        address eventContract
    ) {
        ITezosEvent.TezosEventInitData eventInitData = buildEventInitData(eventVoteData);

        TvmCell stateInit = tvm.buildStateInit({
            contr: TezosTransferTokenEvent,
            varInit: {
                eventInitData: eventInitData
            },
            pubkey: 0,
            code: _basicConfiguration.eventCode
        });

        return {value: 0, flag: MsgFlag.REMAINING_GAS} address(tvm.hash(stateInit));
    }


    function getDetails() override public view responsible returns(
        BasicConfiguration basicConfiguration,
        TezosEventConfiguration networkConfiguration
    ) {
        return {value: 0, flag: MsgFlag.REMAINING_GAS}(
            _basicConfiguration,
            _networkConfiguration
        );
    }

    function getType() override public pure responsible returns(EventType _type) {
        return {value: 0, flag: MsgFlag.REMAINING_GAS} EventType.Tezos;
    }

    function eventConfirmedCallback(
        ITezosEvent.TezosEventInitData eventInitData,
        address gasBackAddress
    ) override external reserveBalance {
        require(
            eventInitData.configuration == address(this),
            ErrorCodes.SENDER_NOT_EVENT_CONTRACT
        );

        TvmCell stateInit = tvm.buildStateInit({
            contr: TezosTransferTokenEvent,
            varInit: {
                eventInitData: eventInitData
            },
            pubkey: 0,
            code: _basicConfiguration.eventCode
        });

        address eventContract = address(tvm.hash(stateInit));

        require(
            eventContract == msg.sender,
            ErrorCodes.SENDER_NOT_EVENT_CONTRACT
        );

        ITransferTokenProxy(_networkConfiguration.proxy).transferTokenCallback{
            flag: MsgFlag.ALL_NOT_RESERVED
        }(eventInitData.voteData.eventData);
    }
}
