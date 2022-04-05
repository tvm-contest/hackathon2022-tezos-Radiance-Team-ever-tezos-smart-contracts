const { TonClient, abiContract, signerKeys } = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { BridgeContract } = require("../ton-packages/Bridge.js");
const { GiverContract } = require("../ton-packages/Giver.js");
const { SetcodeMultisigWalletContract } = require("../ton-packages/SetcodeMultisigWallet.js");

const bridgePathJson = '../keys/Bridge.json';

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
  const { phrase } = await crypto.mnemonic_from_random({
    dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
    word_count: SEED_PHRASE_WORD_COUNT,
  });
  console.log(`Generated seed phrase "${phrase}"`);
  let keyPair = await crypto.mnemonic_derive_sign_keys({
    phrase,
    path: HD_PATH,
    dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
    word_count: SEED_PHRASE_WORD_COUNT,
  });
  const rootKeys = signerKeys(keyPair);
  console.log(rootKeys);

  const bridgeAcc = new Account(BridgeContract, {
    signer: rootKeys,
    client,
  });
  const address = await bridgeAcc.getAddress();
  console.log(`Future address of the contract will be: ${address}`);

  const ownerNTDAddress = process.env.MAIN_GIVER_ADDRESS;
  const ownerNTDKeys = signerKeys({
    public: process.env.MAIN_GIVER_PUBLIC,
    secret: process.env.MAIN_GIVER_SECRET
  });

  const ownerNTDAcc = new Account(SetcodeMultisigWalletContract, {address: ownerNTDAddress,signer: ownerNTDKeys,client,});

  const deployMessage = await client.abi.encode_message(await bridgeAcc.getParamsOfDeployMessage({
    initFunctionName:"constructor",
    initInput:{
      owner:ownerNTDAddress
    },
  }));

  const giverNTDJsonParams = JSON.parse(fs.readFileSync('../keys/GiverContractNTD.json',{encoding: "utf8"}));
  const giverNTDAddress = giverNTDJsonParams.address;
  const giverNTDKeys = giverNTDJsonParams.keys;
  const giverNTDAcc = new Account(GiverContract, {address: giverNTDAddress,signer: giverNTDKeys,client,});
  // Call `sendTransaction` function
  response = await giverNTDAcc.run("sendTransaction", {dest:address,value:500000000,bounce:false});
  console.log("Giver send 0.5 ton to address:", address, response.decoded.output);


  const keyJson = JSON.stringify({address:address, keys:rootKeys, seed:phrase});
  fs.writeFileSync( bridgePathJson, keyJson,{flag:'w'});

  console.log("Future address of the contract  and keys written successfully to:", bridgePathJson);


  let shard_block_id;
  shard_block_id = (await client.processing.send_message({
      message: deployMessage.message,
      send_events: true,
    }, logEvents,
  )).shard_block_id;
  console.log(`Deploy message was sent.`);

  // Monitor message delivery.
  // See more info about `wait_for_transaction` here
  // https://github.com/tonlabs/TON-SDK/blob/master/docs/mod_processing.md#wait_for_transaction
  const deploy_processing_result = await client.processing.wait_for_transaction({
    abi: abiContract(bridgeAcc.abi),
    message: deployMessage.message,
    shard_block_id: shard_block_id,
    send_events: true,
  },
  logEvents,
  );
  // console.log(`Deploy transaction: ${JSON.stringify(deploy_processing_result.transaction, null, 2)}`);
  // console.log(`Deploy fees: ${JSON.stringify(deploy_processing_result.fees, null, 2)}`);
  console.log(`Contract was deployed at address: ${address}`);

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
