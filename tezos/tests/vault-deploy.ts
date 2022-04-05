import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import { char2Bytes } from '@taquito/utils'
const fs = require('fs');
const acc = require('./acc.json')

const provider = 'https://hangzhounet.api.tez.ie'

async function deploy() {
  const tezos = new TezosToolkit(provider)
  tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(acc.secret)});

    // The data to format
  const ISO8601formatedTimestamp = new Date().toISOString();
  const input = 'tz1ZNov8u37BXAuvpeXALq1Gxg4to8GNtsP1';

  // The full string
  const formattedInput: string = [
    // 'Tezos Signed Message:',
    // ISO8601formatedTimestamp,
    input,
  ].join(' ');

  // The bytes to sign
  const bytes = char2Bytes(formattedInput);
  const bytes_from_ever_addr = char2Bytes('dfba18540a11d14ba338bf329cbcaa1f68570a17a9b2fd0395140f7c4a860f24');
  const null_address = "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU";

  try {
    const op = await tezos.contract.originate({
      // считываем код из файла token.json
      code: JSON.parse(fs.readFileSync('./vault.json',{encoding: "utf8"}).toString()),
      storage: {
            request: [{owner:null_address,token_id:0}],
            responce: [{request:{owner:null_address,token_id:0},balance:0}],
            deposit_amt: 0,
            deposit_addr_from: null_address,
            deposit_everscale_dest: bytes_from_ever_addr,
            withdraw_sig_check: false,
            withdraw_addr: null_address,
            withdraw_amt: 0,
      },
    })

    //начало развертывания
    console.log('Awaiting confirmation...')
    const contract = await op.contract()
    //отчет о развертывании: количество использованного газа, значение хранилища
    console.log('Gas Used', op.consumedGas)
    console.log('Storage', await contract.storage())
    //хеш операции, по которому можно найти контракт в блокчейн-обозревателе
    console.log('Operation hash:', op.hash)
  } catch (ex) {
    console.error(ex)
  }
}

deploy()
