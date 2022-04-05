pragma ton-solidity >= 0.39.0;
pragma AbiHeader expire;

import './interfaces/IEverscaleEvent.sol';
import "./interfaces/IEverscaleEventConfiguration.sol";

import './EverscaleTransferTokenEvent.sol';

import './utils/ErrorCodes.sol';
import './utils/MsgFlag.sol';
import './utils/TransferUtils.sol';

contract EverscaleEventConfiguration is IEverscaleEventConfiguration, TransferUtils {

    address _owner;
    BasicConfiguration public _basicConfiguration;
    EverscaleEventConfiguration public _networkConfiguration;


    constructor(address owner, BasicConfiguration basicConfiguration, EverscaleEventConfiguration networkConfiguration) public {
        tvm.accept();
        _owner = owner;
        _basicConfiguration = basicConfiguration;
        _networkConfiguration = networkConfiguration;
    }

    modifier onlyOwner {
        require(msg.sender == _owner);
        _;
    }

    function setConfiguration(BasicConfiguration basicConfiguration, EverscaleEventConfiguration networkConfiguration) public onlyOwner {
        _basicConfiguration = basicConfiguration;
        _networkConfiguration = networkConfiguration;

        msg.sender.transfer({value:0, flag:64});
    }


    function buildEventInitData(
        IEverscaleEvent.EverscaleEventVoteData eventVoteData
    ) internal view returns(
        IEverscaleEvent.EverscaleEventInitData eventInitData
    ) {
        eventInitData.voteData = eventVoteData;

        eventInitData.configuration = address(this);
        eventInitData.bridge = _basicConfiguration.bridge;
    }


    function deployEvent(
        IEverscaleEvent.EverscaleEventVoteData eventVoteData
    ) override external reserveBalance {
        require(msg.sender == _networkConfiguration.eventEmitter, ErrorCodes.SENDER_IS_NOT_EVENT_EMITTER);
        require(msg.value >= _basicConfiguration.eventInitialBalance, ErrorCodes.TOO_LOW_DEPLOY_VALUE);

        //todo check
        require(
            eventVoteData.eventTimestamp >= _networkConfiguration.startTimestamp,
            ErrorCodes.EVENT_TIMESTAMP_LESS_THAN_START
        );

        if (_networkConfiguration.endTimestamp != 0) {
            require(
                eventVoteData.eventTimestamp <= _networkConfiguration.endTimestamp,
                ErrorCodes.EVENT_TIMESTAMP_HIGHER_THAN_END
            );
        }


        IEverscaleEvent.EverscaleEventInitData eventInitData = buildEventInitData(eventVoteData);

        address eventContract = deriveEventAddress(eventVoteData);

        emit NewEventContract(eventContract);

        new EverscaleTransferTokenEvent{
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
        IEverscaleEvent.EverscaleEventVoteData eventVoteData
    )
        override
        public
        view
        responsible
    returns (
        address eventContract
    ) {
        IEverscaleEvent.EverscaleEventInitData eventInitData = buildEventInitData(eventVoteData);

        TvmCell stateInit = tvm.buildStateInit({
            contr: EverscaleTransferTokenEvent,
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
        EverscaleEventConfiguration networkConfiguration
    ) {
        return {value: 0, flag: MsgFlag.REMAINING_GAS}(
            _basicConfiguration,
            _networkConfiguration
        );
    }


    function getType() override public pure responsible returns(EventType _type) {
        return {value: 0, flag: MsgFlag.REMAINING_GAS} EventType.Everscale;
    }
}
