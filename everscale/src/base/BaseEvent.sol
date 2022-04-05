pragma ton-solidity >=0.43.0;
pragma AbiHeader time;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "../interfaces/IBaseEvent.sol";
import '../interfaces/IBridge.sol';

import '../utils/ErrorCodes.sol';
import '../utils/MsgFlag.sol';
import '../utils/TransferUtils.sol';

abstract contract BaseEvent is IBaseEvent, TransferUtils {
    // Event contract status
    Status public status;
    // Relays votes
    mapping (uint => Vote) public votes;
    // Event contract deployer
    address public initializer;
    // How many votes required for confirm / reject
    uint32 public requiredVotes;
    // How many relays confirm event
    uint16 public confirms;
    // How many relays rejects event
    uint16 public rejects;

    modifier onlyInitializer() {
        require(msg.sender == initializer);
        _;
    }

    modifier eventInitializing() {
        require(status == Status.Initializing);
        _;
    }

    modifier eventPending() {
        require(status == Status.Pending);
        _;
    }

    modifier onlyRelayAddress() {
        require(msg.sender == getRelayAddress());
        _;
    }

    function onInit() virtual internal {}
    function onConfirm() virtual internal {}
    function onReject() virtual internal {}

    function getRelayAddress() virtual internal view returns (address);

    //todo edit
    function loadRelays() internal view {
        IBridge(getRelayAddress()).getRelayKeys{
            value: 1 ton,
            callback: receiveRelayKeys
        }();
    }

    function checkVoteReceiver(address voteReceiver) internal {
        require(voteReceiver == address(this), ErrorCodes.WRONG_VOTE_RECEIVER);
    }

    function checkVoteKey(uint key) internal {
        require(votes[key] == Vote.Empty, ErrorCodes.KEY_VOTE_NOT_EMPTY);
    }

    function receiveRelayKeys(uint[] keys) public onlyRelayAddress eventInitializing {
        requiredVotes = uint16(keys.length * 2 / 3) + 1;

        for (uint key: keys) {
        votes[key] = Vote.Empty;
        }

        status = Status.Pending;
    }

    function getVoters(Vote vote) public view responsible returns(uint[] voters) {
        for ((uint voter, Vote vote_): votes) {
            if (vote_ == vote) {
                voters.push(voter);
            }
        }

        return {value: 0, flag: MsgFlag.REMAINING_GAS} voters;
    }

    function getVote(uint256 voter) public view responsible returns(optional(Vote) vote) {
        return {value: 0, flag: MsgFlag.REMAINING_GAS} votes.fetch(voter);
    }
}
