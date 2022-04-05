const { TonClient, abiContract, signerKeys } = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { BridgeContract } = require("../ton-packages/Bridge.js");
const { GiverContract } = require("../ton-packages/Giver.js");
const { SetcodeMultisigWalletContract } = require("../ton-packages/SetcodeMultisigWallet.js");

const bridgePathJson = '../keys/Bridge.json';

const hex2ascii = require('hex2ascii');
const fs = require('fs');
const {TezosEventConfigurationContract} = require("../ton-packages/TezosEventConfiguration.js");

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

  const bridgeAddr = JSON.parse(fs.readFileSync(bridgePathJson,{encoding: "utf8"})).address;
  // const bridgeKeys = JSON.parse(fs.readFileSync(bridgePathJson,{encoding: "utf8"})).keys;

  const bridgeAcc = new Account(BridgeContract, {
    address:bridgeAddr,
    // signer: bridgeKeys,
    client,
  });

  const ownerNTDAddress = process.env.MAIN_GIVER_ADDRESS;
  const ownerNTDKeys = signerKeys({
    public: process.env.MAIN_GIVER_PUBLIC,
    secret: process.env.MAIN_GIVER_SECRET
  });

  const ownerNTDAcc = new Account(SetcodeMultisigWalletContract, {address: ownerNTDAddress,signer: ownerNTDKeys,client,});

  response = await bridgeAcc.runLocal("getInfo", {});
  console.log("Contract reacted to your getInfo:", response.decoded.output);

  for (const configurationAddr of response.decoded.output.configurations) {
    const configurationAcc = new Account(TezosEventConfigurationContract, {
      address:configurationAddr,
      // signer: bridgeKeys,
      client,
    });

    // response = await configurationAcc.runLocal("getDetails", {answerId:0});
    // console.log("Contract reacted to your getInfo:", response.decoded.output);

    response = await configurationAcc.runLocal("getType", {answerId:0});
    console.log("Contract reacted to your getInfo:", response.decoded.output);
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
