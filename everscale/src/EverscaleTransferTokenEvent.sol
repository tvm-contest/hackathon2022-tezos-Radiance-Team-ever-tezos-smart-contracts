pragma ton-solidity >= 0.39.0;
pragma AbiHeader time;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "./base/BaseEvent.sol";
import "./interfaces/IEverscaleEvent.sol";

import "./utils/ErrorCodes.sol";

contract EverscaleTransferTokenEvent is BaseEvent, IEverscaleEvent {

    EverscaleEventInitData static eventInitData;

    mapping (uint => bytes) public signatures;

    event Confirm(uint relay, bytes signature);

    constructor(
        address _initializer
    ) public {
        require(eventInitData.configuration == msg.sender, ErrorCodes.SENDER_NOT_EVENT_CONFIGURATION);

        status = Status.Initializing;
        initializer = _initializer;
        onInit();
        loadRelays();
    }

    function getEventInitData() public view responsible returns (EverscaleEventInitData) {
        return {value: 0, flag: MsgFlag.REMAINING_GAS} eventInitData;
    }

    function onInit() override internal {
        //        notifyEventStatusChanged();
    }

    function onConfirm() override internal {
        //        notifyEventStatusChanged();
    }

    function onReject() override internal {
        //        notifyEventStatusChanged();
        transferAll(initializer);
    }

    function getRelayAddress() override internal view returns (address) {
        return eventInitData.bridge;
    }


    function confirm(bytes signature, address voteReceiver) public {
        checkVoteReceiver(voteReceiver);

        uint relay = msg.pubkey();

        checkVoteKey(relay);

        tvm.accept();

        votes[relay] = Vote.Confirm;
        signatures[relay] = signature;

        emit Confirm(relay, signature);
        confirms++;

        // Event already confirmed
        if (status != Status.Pending) {
            return;
        }

        if (confirms >= requiredVotes) {
            status = Status.Confirmed;
            onConfirm();
        }
    }


    function reject(address voteReceiver) public {
        checkVoteReceiver(voteReceiver);

        uint relay = msg.pubkey();

        checkVoteKey(relay);

        tvm.accept();

        votes[relay] = Vote.Reject;

        emit Reject(relay);
        rejects++;

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
        EverscaleEventInitData _eventInitData,
        Status _status,
        uint[] _confirms,
        uint[] _rejects,
        uint[] empty,
        bytes[] _signatures,
        uint128 balance,
        address _initializer,
        uint32 _requiredVotes
    ) {
        _confirms = getVoters(Vote.Confirm);

        for (uint voter : _confirms) {
            _signatures.push(signatures[voter]);
        }

        return {value: 0, flag: MsgFlag.REMAINING_GAS} (
            eventInitData,
            status,
            _confirms,
            getVoters(Vote.Reject),
            getVoters(Vote.Empty),
            _signatures,
            address(this).balance,
            initializer,
            requiredVotes
        );
    }
}
