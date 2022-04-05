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

  const tezosEventConfigurationAddr = JSON.parse(fs.readFileSync(tezosEventConfigurationPathJson,{encoding: "utf8"})).address;
  const everscaleEventConfigurationAddr = JSON.parse(fs.readFileSync(everscaleEventConfigurationPathJson,{encoding: "utf8"})).address;

  const configurationForBridge = [
    tezosEventConfigurationAddr,
    everscaleEventConfigurationAddr
  ];

  console.log(configurationForBridge);


  const bridgeAddr = JSON.parse(fs.readFileSync(bridgePathJson,{encoding: "utf8"})).address;
  // const bridgeKeys = JSON.parse(fs.readFileSync(bridgePathJson,{encoding: "utf8"})).keys;

  const bridgeAcc = new Account(BridgeContract, {
    address:bridgeAddr,
    // signer: bridgeKeys,
    client,
  });


  console.log("set configuration for bridge:", bridgeAddr);


  const { body } = (await client.abi.encode_message_body({
    abi: bridgeAcc.abi,
    call_set: {
      function_name: "setConfigurations",
      input: {
        configurations: configurationForBridge,
      },
    },
    is_internal: true,
    signer: signerNone(),
  }));

  console.log(body);


  response = await ownerNTDAcc.run("sendTransaction", {
    dest: bridgeAddr,
    value: 1500000000,
    bounce: true,
    flags: 3,
    payload: body,
  });

  console.log("configuration for bridge:", bridgeAddr, response.decoded.output);
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
