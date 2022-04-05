pragma ton-solidity >=0.43.0;

pragma AbiHeader expire;
pragma AbiHeader time;

import './utils/CellEncoder.sol';
import './libraries/Constants.sol';
import './interfaces/ITransferTokenProxy.sol';
import './interfaces/ITokenRoot.sol';
import './interfaces/ITIP3TokenRoot.sol';
import './interfaces/IAcceptTokensBurnCallback.sol';
import './interfaces/IEverscaleEventConfiguration.sol';

contract TransferTokenProxy is ITransferTokenProxy, CellEncoder, IAcceptTokensBurnCallback {

    address _owner;
    address _addrTokenRoot;
    address _addrTezosEventConfiguration;
    address _addrEverscaleEventConfiguration;

    event Withdraw(int8 wid, uint256 recipient, uint128 amount);
    event ToTezos(string recipient, uint128 amount);

    constructor(
      address owner,
      address addrTezosEventConfiguration,
      address addrEverscaleEventConfiguration,
      address addrTokenRoot
    ) public {
        tvm.accept();
        _owner = owner;
        _addrTokenRoot = addrTokenRoot;
        _addrTezosEventConfiguration = addrTezosEventConfiguration;
        _addrEverscaleEventConfiguration = addrEverscaleEventConfiguration;
    }

    modifier onlyOwner {
        require(msg.sender == _owner);
        _;
    }

    function setConfiguration(address addrTezosEventConfiguration, address addrEverscaleEventConfiguration, address addrTokenRoot) public onlyOwner {
        _addrTokenRoot = addrTokenRoot;
        _addrTezosEventConfiguration = addrTezosEventConfiguration;
        _addrEverscaleEventConfiguration = addrEverscaleEventConfiguration;

        msg.sender.transfer({value:0, flag:64});
    }

    function transferTokenCallback(TvmCell data) public override {

        require(msg.sender == _addrTezosEventConfiguration);

        //todo MIN_FOR_TRANSFER_TOKEN
        require(msg.value >= Constants.MIN_FOR_TRANSFER_TOKEN);

        tvm.rawReserve(address(this).balance - msg.value, 2);
        (
            int8 wid,
            uint256 recipient,
            uint128 amount
        ) = decodeTezosEventData(data);

        address addrRecipient = address.makeAddrStd(wid, recipient);

        TvmBuilder builder;
        builder.store(uint8(0));
        TvmCell payload = builder.toCell();

        uint128 forWallet = 0.4 ton;

        uint128 fee = (amount * 5) / 1000;

        uint128 amountWithoutFee = amount - fee;

        ITIP3TokenRoot(_addrTokenRoot).mint{value: 0.8 ton, flag: 0}(fee, _owner, forWallet, msg.sender, true, payload);

        ITIP3TokenRoot(_addrTokenRoot).mint{value: 0, flag: 128}(amountWithoutFee, addrRecipient, forWallet, msg.sender, true, payload);

    }

    function burnTokenCallback(uint128 amount, TvmCell payload) public override {

        require(_addrTokenRoot == msg.sender);

        tvm.rawReserve(address(this).balance - msg.value, 2);

        (int8 wid, uint256 recipient) = decodePayload(payload);

        emit Withdraw(wid, recipient, amount);

        TvmCell eventData = encodeEverscaleEventData(
            wid,
            recipient,
            amount
        );

        IEverscaleEvent.EverscaleEventVoteData eventVoteData = IEverscaleEvent.EverscaleEventVoteData(tx.timestamp, now, eventData);

        IEverscaleEventConfiguration(_addrEverscaleEventConfiguration).deployEvent{
            value: 0,
            flag: 128
        }(eventVoteData);
    }

    function onAcceptTokensBurn (
      uint128 amount,
      address walletOwner,
      address wallet,
      address remainingGasTo,
      TvmCell payload
    ) public override {

        require(_addrTokenRoot == msg.sender);

        tvm.rawReserve(address(this).balance - msg.value, 2);

        string recipient = decodeTezosAddrPayload(payload);

        emit ToTezos(recipient, amount);

        TvmCell eventData = encodeToTezosPayload(
            recipient,
            amount
        );

        IEverscaleEvent.EverscaleEventVoteData eventVoteData = IEverscaleEvent.EverscaleEventVoteData(tx.timestamp, now, eventData);

        IEverscaleEventConfiguration(_addrEverscaleEventConfiguration).deployEvent{
            value: 0,
            flag: 128
        }(eventVoteData);
    }

    function getInfo() public view returns (
        address owner,
        address addrTokenRoot,
        address addrTezosEventConfiguration,
        address addrEverscaleEventConfiguration
    ) {
        return  (_owner, _addrTokenRoot, _addrTezosEventConfiguration, _addrEverscaleEventConfiguration);
    }
}
