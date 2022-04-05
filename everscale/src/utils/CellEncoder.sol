pragma ton-solidity >= 0.43.0;

contract CellEncoder {
  function encodeTezosEventData(
    int8 wid,
    uint256 recipient,
    uint128 amount
  ) public pure returns(
    TvmCell data
  ) {
    TvmBuilder builder;

    builder.store(wid, recipient, amount);

    data = builder.toCell();
  }

  function decodeTezosEventData(
    TvmCell data
  ) public pure returns(
    int8 wid,
    uint256 recipient,
    uint128 amount
  ) {
    (
      wid,
      recipient,
      amount
    ) = data.toSlice().decode(int8, uint256, uint128);
  }

  function encodeEverscaleEventData(
    int8 wid,
    uint256 recipient,
    uint128 amount
  ) public pure returns(
    TvmCell data
  ) {
    TvmBuilder builder;

    builder.store(wid, recipient, amount);

    data = builder.toCell();
  }

  function decodeEverscaleEventData(
    TvmCell data
  ) public pure returns(
    int8 wid,
    uint256 recipient,
    uint128 amount
  ) {
    (
      wid,
      recipient,
      amount
    ) = data.toSlice().decode(int8, uint256, uint128);
  }

  function encodePayload(
    int8 wid,
    uint256 recipient
  ) public pure returns(
    TvmCell data
  ) {
    TvmBuilder builder;

    builder.store(wid, recipient);

    data = builder.toCell();
  }

  function decodePayload(
    TvmCell data
  ) public pure returns(
    int8 wid,
    uint256 recipient
  ) {
    (
      wid,
      recipient
    ) = data.toSlice().decode(int8, uint256);
  }

  function encodeTezosAddrPayload(string recipient) public pure returns(TvmCell data) {

    TvmBuilder builder;

    builder.store(recipient);

    data = builder.toCell();

  }

  function decodeTezosAddrPayload(TvmCell data) public pure returns(string recipient) {

    recipient = data.toSlice().decode(string);

  }

  function encodeToTezosPayload(string recipient, uint128 amt) public pure returns(TvmCell data) {

    TvmBuilder builder;

    builder.store(recipient, amt);

    data = builder.toCell();
  }

  function decodeToTezosPayload(TvmCell data) public pure returns(string recipient, uint128 amt) {

    (recipient, amt) = data.toSlice().decode(string, uint128);

  }

}
