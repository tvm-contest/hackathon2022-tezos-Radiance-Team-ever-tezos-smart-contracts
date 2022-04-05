const { TonClient, abiContract, signerKeys, signerNone } = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { BridgeContract } = require("../ton-packages/Bridge.js");
const { TokenRootContract } = require("../ton-packages/TokenRoot.js");
const { TransferTokenProxyContract } = require("../ton-packages/TransferTokenProxy.js");
const { EverscaleTransferTokenEventContract } = require("../ton-packages/EverscaleTransferTokenEvent.js");
const { EverscaleEventConfigurationContract } = require("../ton-packages/EverscaleEventConfiguration.js");

const { GiverContract } = require("../ton-packages/Giver.js");
const { SetcodeMultisigWalletContract } = require("../ton-packages/SetcodeMultisigWallet.js");

const bridgePathJson = '../keys/Bridge.json';
const proxyPathJson = '../keys/TransferTokenProxy.json';
const tokenRootPathJson = '../keys/TokenRoot.json';
const everscaleEventConfigurationPathJson = '../keys/EverscaleEventConfiguration.json';
const tezosEventConfigurationPathJson = '../keys/TezosEventConfiguration.json';

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

  const everscaleEventConfigurationJsonPrams = JSON.parse(fs.readFileSync(everscaleEventConfigurationPathJson,{encoding: "utf8"}));
  const everscaleEventConfigurationAddr = everscaleEventConfigurationJsonPrams.address;
  // const contractKeys = contractJsonPrams.keys;

  const everscaleEventCOnfigurationAcc = new Account(EverscaleEventConfigurationContract, {
    address:everscaleEventConfigurationAddr,
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
    wid: 2,
    recipient: '0x'+'b6ad8175fd6870e93fe44908c01831269065f8890ad119c5917bad088e192c43',
    amount: 222
  }

  response = await proxyAcc.runLocal("encodeEverscaleEventData", paramsEvent);
  console.log("Contract reacted to your encodeEverscaleEventData:", response.decoded.output);

  const eventData = response.decoded.output.data;

  const eventVoteData = {
    eventTransactionLt: '0x2061a9483c5',
    eventTimestamp: 1645621724,
    eventData: eventData
  };

  response = await everscaleEventCOnfigurationAcc.runLocal("deriveEventAddress", {eventVoteData:eventVoteData, answerId:0});
  console.log("Contract reacted to your deriveEventAddress:", response.decoded.output);

  const eventAddr = response.decoded.output.eventContract;

  console.log('confirm event:', eventAddr);

  const tokeRootKeys = JSON.parse(fs.readFileSync(tokenRootPathJson,{encoding: "utf8"})).keys;
  const proxyKeys = JSON.parse(fs.readFileSync(proxyPathJson,{encoding: "utf8"})).keys;
  const tezosEventConfigurationKeys = JSON.parse(fs.readFileSync(tezosEventConfigurationPathJson,{encoding: "utf8"})).keys;

  const relayKeysForConfirm = [
    tokeRootKeys,
    proxyKeys,
    tezosEventConfigurationKeys
  ];

  for (const relayKeys of relayKeysForConfirm) {
    const eventAcc = new Account(EverscaleTransferTokenEventContract, {
      address:eventAddr,
      signer: relayKeys,
      client,
    });

    response = await eventAcc.run("confirm", {voteReceiver: eventAddr, signature: '9a9f5a08976812'});
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
