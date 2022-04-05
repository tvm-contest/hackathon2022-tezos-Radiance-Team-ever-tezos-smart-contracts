const { TonClient, abiContract, signerKeys, signerNone} = require("@tonclient/core");
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

  const contractPathJson = tezosEventConfigurationPathJson;
  const contractJsContract = TezosEventConfigurationContract;


  const contractJsonPrams = JSON.parse(fs.readFileSync(contractPathJson,{encoding: "utf8"}));
  const contractAddr = contractJsonPrams.address;
  // const contractKeys = contractJsonPrams.keys;

  const contractAcc = new Account(contractJsContract, {
    address:contractAddr,
    // signer: bridgeKeys,
    client,
  });


  const bridgeAddr = JSON.parse(fs.readFileSync(bridgePathJson,{encoding: "utf8"})).address;
  const proxyAddr = JSON.parse(fs.readFileSync(proxyPathJson,{encoding: "utf8"})).address;


  console.log("update configuration for tezos configuration:", contractAddr);


  const { body } = (await client.abi.encode_message_body({
    abi: contractAcc.abi,
    call_set: {
      function_name: "setConfiguration",
      input: {
        basicConfiguration: {
          bridge: bridgeAddr,
          eventABI: '2132',
          eventInitialBalance: '1400000000',
          eventCode: TezosTransferTokenEventContract.code
        },
        networkConfiguration: {
          chainId: '1',
          eventEmitter: '1241',
          eventBlocksToConfirm: '12',
          proxy: proxyAddr,
          startBlockNumber: '1',
          endBlockNumber: '111'
        }
      },
    },
    is_internal: true,
    signer: signerNone(),
  }));

  // console.log(body);


  response = await ownerNTDAcc.run("sendTransaction", {
    dest: contractAddr,
    value: 1500000000,
    bounce: true,
    flags: 3,
    payload: body,
  });

  console.log("update configuration for tezos configuration:", contractAddr, response.decoded.output);

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
