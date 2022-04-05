const fs = require('fs');
const { exec } = require("child_process");

let nameArr = ["TokenRoot", "TransferTokenProxy", "TezosEventConfiguration", "Bridge", "TezosTransferTokenEvent", "EverscaleEventConfiguration", "EverscaleTransferTokenEvent"];

for (const item of nameArr) {
  exec(`everdev sol compile ./src/${item}.sol -o ./build/`, (error, stdout, stderr) => {
    if (error) {console.log(`error: ${error.message}`);return;}
    if (stderr) {console.log(`stderr: ${stderr}`);return;}
    console.log(`stdout sol compile ${item}.sol: ${stdout}`);
    exec(`~/.everdev/solidity/tvm_linker decode --tvc ./build/${item}.tvc | grep code: | cut -c 8- > ./build/${item}.txt`, (error, stdout, stderr) => {
      if (error) {console.log(`error: ${error.message}`);return;}
      if (stderr) {console.log(`stderr: ${stderr}`);return;}
      console.log(`stdout tvm_linker decode ${item}.tvc: ${stdout}`);
      let abiRaw = fs.readFileSync(`./build/${item}.abi.json`);
      let abi = JSON.parse(abiRaw);
      let image = fs.readFileSync(`./build/${item}.tvc`, {encoding: "base64",});
      let code = fs.readFileSync(`./build/${item}.txt`, {encoding: "utf8",});
      code = code.substring(0, code.length - 1);
      fs.writeFileSync(`./ton-packages/${item}.js`,`module.exports = {${item}Contract:{abi:${JSON.stringify(abi)},tvc:${JSON.stringify(image)},code:${JSON.stringify(code)}}};`);
      console.log(`create and writeFileSyn ./ton-packages/${item}.js`);
    });
  });
}
