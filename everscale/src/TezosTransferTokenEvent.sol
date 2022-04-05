pragma ton-solidity >=0.43.0;
pragma AbiHeader time;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "./base/BaseEvent.sol";
import "./interfaces/ITezosEvent.sol";
import './interfaces/ITezosEventConfiguration.sol';

contract TezosTransferTokenEvent is BaseEvent, ITezosEvent {

    TezosEventInitData static eventInitData;

    event Confirm(uint relay);

    constructor(
        address _initializer
    ) public {
        require(eventInitData.configuration == msg.sender, ErrorCodes.SENDER_NOT_EVENT_CONFIGURATION);

        status = Status.Initializing;
        initializer = _initializer;
        onInit();
        loadRelays();
    }

    function getEventInitData() public view responsible returns (TezosEventInitData) {
        return {value: 0, flag: MsgFlag.REMAINING_GAS} eventInitData;
    }

    function onInit() override internal {
//        notifyEventStatusChanged();
    }

    function onConfirm() override internal {
//        notifyEventStatusChanged();

        ITezosEventConfiguration(eventInitData.configuration).eventConfirmedCallback{
            flag: MsgFlag.ALL_NOT_RESERVED
        }(eventInitData, initializer);
    }

    function onReject() override internal {
//        notifyEventStatusChanged();
        transferAll(initializer);
    }

    function getRelayAddress() override internal view returns (address) {
        return eventInitData.bridge;
    }

    function confirm(address voteReceiver) public eventPending {
        checkVoteReceiver(voteReceiver);

        uint relay = msg.pubkey();

        checkVoteKey(relay);

        tvm.accept();

        votes[relay] = Vote.Confirm;
        confirms++;

        emit Confirm(relay);

        // Event already confirmed
        if (status != Status.Pending) {
            return;
        }

        if (confirms >= requiredVotes) {
            status = Status.Confirmed;
            onConfirm();
        }
    }

    function reject(address voteReceiver) public eventPending {
        checkVoteReceiver(voteReceiver);

        uint relay = msg.pubkey();

        checkVoteKey(relay);

        tvm.accept();

        votes[relay] = Vote.Reject;
        rejects++;

        emit Reject(relay);

        // Event already confirmed
        if (status != Status.Pending) {
            return;
        }

        if (rejects >= requiredVotes) {
            status = Status.Rejected;
            onReject();
        }
    }


    function getDetails() public view responsible returns (
        TezosEventInitData _eventInitData,
        Status _status,
        uint[] _confirms,
        uint[] _rejects,
        uint[] empty,
        uint128 balance,
        address _initializer,
        uint32 _requiredVotes
    ) {
        return {value: 0, flag: MsgFlag.REMAINING_GAS} (
            eventInitData,
            status,
            getVoters(Vote.Confirm),
            getVoters(Vote.Reject),
            getVoters(Vote.Empty),
            address(this).balance,
            initializer,
            requiredVotes
        );
    }
}
