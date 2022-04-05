const { TonClient, abiContract, signerKeys, signerNone } = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { BridgeContract } = require("../ton-packages/Bridge.js");

const { TokenRootContract } = require("../ton-packages/TokenRoot.js");
const { TokenWalletContract } = require("../ton-packages/TokenWallet.js");

const { TransferTokenProxyContract } = require("../ton-packages/TransferTokenProxy.js");
const { EverscaleTransferTokenEventContract } = require("../ton-packages/EverscaleTransferTokenEvent.js");
const { EverscaleEventConfigurationContract } = require("../ton-packages/EverscaleEventConfiguration.js");

const { GiverContract } = require("../ton-packages/Giver.js");
const { SetcodeMultisigWalletContract } = require("../ton-packages/SetcodeMultisigWallet.js");

const bridgePathJson = '../keys/Bridge.json';
const proxyPathJson = '../keys/TransferTokenProxy.json';
const tokenRootPathJson = '../keys/TokenRoot.json';
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

  const SEED_PHRASE_WORD_COUNT = 12;
  const SEED_PHRASE_DICTIONARY_ENGLISH = 1;
  const HD_PATH = "m/44'/396'/0'/0/0";
  const { crypto } = client;
  const phrase = process.env.EVERWALLET_SEED;
  console.log(`Everwallet seed phrase "${phrase}"`);

  let keyPair = await crypto.mnemonic_derive_sign_keys({
    phrase,
    path: HD_PATH,
    dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
    word_count: SEED_PHRASE_WORD_COUNT,
  });

  console.log(`Everwallet key public "${keyPair.public}"`);

  const ownerNTDAddress = process.env.EVERWALLET_ADDR;
  const ownerNTDKeys = signerKeys(keyPair);

  const ownerNTDAcc = new Account(SetcodeMultisigWalletContract, {address: ownerNTDAddress, signer: ownerNTDKeys,client,});

  // const everscaleEventConfigurationJsonPrams = JSON.parse(fs.readFileSync(everscaleEventConfigurationPathJson,{encoding: "utf8"}));
  // const everscaleEventConfigurationAddr = everscaleEventConfigurationJsonPrams.address;
  // const contractKeys = contractJsonPrams.keys;

  // const everscaleEventCOnfigurationAcc = new Account(EverscaleEventConfigurationContract, {
  //   address:everscaleEventConfigurationAddr,
  //   client,
  // });


  const proxyJsonPrams = JSON.parse(fs.readFileSync(proxyPathJson,{encoding: "utf8"}));
  const proxyAddr = proxyJsonPrams.address;
  // const contractKeys = contractJsonPrams.keys;

  const proxyAcc = new Account(TransferTokenProxyContract, {
    address:proxyAddr,
    // signer: bridgeKeys,
    client,
  });

  const tokenJsonPrams = JSON.parse(fs.readFileSync(tokenRootPathJson,{encoding: "utf8"}));
  const tokenAddr = tokenJsonPrams.address;
  // const contractKeys = contractJsonPrams.keys;

  const tokenAcc = new Account(TokenRootContract, {
    address:tokenAddr,
    // signer: bridgeKeys,
    client,
  });

  response = await tokenAcc.runLocal("walletOf", {answerId:0, walletOwner: process.env.EVERWALLET_ADDR});
  console.log("Contract reacted to your walletOf:", response.decoded.output.value0);

  let walletOf = response.decoded.output.value0;

  const walletAcc = new Account(TokenWalletContract, {
    address: walletOf,
    // signer: keyPair,
    client,
  });

  response = await walletAcc.runLocal("balance", {answerId:0});
  console.log("Contract reacted to your balance:", response.decoded.output.value0);



  console.log("burn token for deploy event data");

  const paramsBurn = {
    recipient:'tz1ZNov8u37BXAuvpeXALq1Gxg4to8GNtsP1'
  }
  const amountToken = 50000000000;

  response = await proxyAcc.runLocal("encodeTezosAddrPayload", paramsBurn);
  console.log("Contract reacted to your encodeTezosAddrPayload:", response.decoded.output);

  const payloadToken = response.decoded.output.data;

  const { body } = (await client.abi.encode_message_body({
    abi: walletAcc.abi,
    call_set: {
      function_name: "burn",
      input: {
        amount: amountToken,
        remainingGasTo: process.env.EVERWALLET_ADDR,
        callbackTo: proxyAddr,
        payload: payloadToken
      },
    },
    is_internal: true,
    signer: signerNone(),
  }));

  console.log(body);

  response = await ownerNTDAcc.run("sendTransaction", {
    dest: walletOf,
    value: 1600000000,
    bounce: true,
    flags: 3,
    payload: body,
  });

  console.log("send burn token for token wallet:", walletOf, response.decoded.output);
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
