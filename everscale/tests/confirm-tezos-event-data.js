const { TonClient, abiContract, signerKeys, signerNone } = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { BridgeContract } = require("../ton-packages/Bridge.js");
const { TokenRootContract } = require("../ton-packages/TokenRoot.js");
const { TransferTokenProxyContract } = require("../ton-packages/TransferTokenProxy.js");
const { TezosTransferTokenEventContract } = require("../ton-packages/TezosTransferTokenEvent.js");
const { TezosEventConfigurationContract } = require("../ton-packages/TezosEventConfiguration.js");

const { GiverContract } = require("../ton-packages/Giver.js");
const { SetcodeMultisigWalletContract } = require("../ton-packages/SetcodeMultisigWallet.js");

const bridgePathJson = '../keys/Bridge.json';
const proxyPathJson = '../keys/TransferTokenProxy.json';
const tokenRootPathJson = '../keys/TokenRoot.json';
const tezosEventConfigurationPathJson = '../keys/TezosEventConfiguration.json';
const everscaleEventConfigurationPathJson = '../keys/EverscaleEventConfiguration.json';

const fs = require('fs');

const dotenv = require('dotenv').config();
const networks = ["http://localhost",'net1.ton.dev','main.ton.dev','rustnet.ton.dev','https://gql.custler.net'];
const hello = ["Hello localhost TON!","Hello dev net TON!","Hello main net TON!","Hello rust dev net TON!","Hello fld dev net TON!"];
const networkSelector = process.env.NET_SELECTOR;

const zeroAddress = '0:0000000000000000000000000000000000000000000000000000000000000000';


TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
  // console.log(`params = ${JSON.stringify(params, null, 2)}`);
  // console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

async function main(client) {
  let response;

  const ownerNTDAddress = process.env.MAIN_GIVER_ADDRESS;
  const ownerNTDKeys = signerKeys({
    public: process.env.MAIN_GIVER_PUBLIC,
    secret: process.env.MAIN_GIVER_SECRET
  });

  const ownerNTDAcc = new Account(SetcodeMultisigWalletContract, {address: ownerNTDAddress,signer: ownerNTDKeys,client,});

  const tezosEventConfigurationJsonPrams = JSON.parse(fs.readFileSync(tezosEventConfigurationPathJson,{encoding: "utf8"}));
  const tezosEventConfigurationAddr = tezosEventConfigurationJsonPrams.address;
  // const contractKeys = contractJsonPrams.keys;

  const tezosEventCOnfigurationAcc = new Account(TezosEventConfigurationContract, {
    address:tezosEventConfigurationAddr,
    client,
  });


  const proxyJsonPrams = JSON.parse(fs.readFileSync(proxyPathJson,{encoding: "utf8"}));
  const proxyAddr = proxyJsonPrams.address;
  // const contractKeys = contractJsonPrams.keys;

  const proxyAcc = new Account(TransferTokenProxyContract, {
    address:proxyAddr,
    // signer: bridgeKeys,
    client,
  });

  console.log("get event data info");

  const paramsEvent = {
    wid: 0,
    recipient: '0x'+'dfba18540a11d14ba338bf329cbcaa1f68570a17a9b2fd0395140f7c4a860f24',
    amount: 1000000000000
  }

  response = await proxyAcc.runLocal("encodeTezosEventData", paramsEvent);
  console.log("Contract reacted to your encodeTezosEventData:", response.decoded.output);

  const eventData = response.decoded.output.data;

  const eventVoteData = {
    eventID: 222,
    eventBlockHash: '27545f0bcead',
    eventData: eventData,
    eventTransactionHash: 'b0319f4cd8',
  };

  response = await tezosEventCOnfigurationAcc.runLocal("deriveEventAddress", {eventVoteData:eventVoteData, answerId:0});
  console.log("Contract reacted to your deriveEventAddress:", response.decoded.output);

  const eventAddr = response.decoded.output.eventContract;

  console.log('confirm event:', eventAddr);

  const everscaleEventConfigurationKeys = JSON.parse(fs.readFileSync(everscaleEventConfigurationPathJson,{encoding: "utf8"})).keys;
  const proxyKeys = JSON.parse(fs.readFileSync(proxyPathJson,{encoding: "utf8"})).keys;
  const tezosEventConfigurationKeys = JSON.parse(fs.readFileSync(tezosEventConfigurationPathJson,{encoding: "utf8"})).keys;

  const relayKeysForConfirm = [
    everscaleEventConfigurationKeys,
    proxyKeys,
    tezosEventConfigurationKeys
  ];

  for (const relayKeys of relayKeysForConfirm) {
    console.log(relayKeys);
    const eventAcc = new Account(TezosTransferTokenEventContract, {
      address:eventAddr,
      signer: relayKeys,
      client,
    });

    response = await eventAcc.run("confirm", {voteReceiver: eventAddr});
    console.log("Contract reacted to your confirm:", response.decoded.output);

  }

}

(async () => {
  const client = new TonClient({network: { endpoints: [networks[networkSelector]],},});
  try {
    console.log(hello[networkSelector]);
    await main(client);
    process.exit(0);
  } catch (error) {
    if (error.code === 504) {
      console.error(`Network is inaccessible. Pls check connection`);
    } else {
      console.error(error);
    }
  }
  client.close();
})();
