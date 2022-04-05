import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
const fs = require('fs');
const hex = require('ascii-hex');
const acc = require('./acc.json')


const provider = 'https://hangzhounet.api.tez.ie'
// const name = toHex("FA2 Test Token");
// const symbol = toHex("FA2");
// const decimals = toHex("9");
// const metadata = toHex("FA2 single asset contract");
// const minter = "tz1ZNov8u37BXAuvpeXALq1Gxg4to8GNtsP1";


async function deploy() {
  const tezos = new TezosToolkit(provider)
  tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(acc.secret)});

  try {
    const op = await tezos.contract.originate({
      // считываем код из файла token.json
      code: JSON.parse(fs.readFileSync('./token.json',{encoding: "utf8"}).toString()),
      // задаем состояние хранилища на языке Michelson. Замените оба адреса на адрес своего аккаунта в тестовой сети,
      // а числа — на количество токенов, которое вы хотите выпустить
      init: `(Pair (Pair (Pair (Pair "tz1ZNov8u37BXAuvpeXALq1Gxg4to8GNtsP1" False) None) (Pair (Pair {} {}) (Pair (Right (Right Unit)) (Right (Left Unit)) (Right (Left Unit)) None){ Elt 0 (Pair 0 { Elt "decimals" 0x39 ; Elt "name" 0x74657A6F7320546574686572 ; Elt "symbol" 0x7455534454 })})0){ Elt "" 0x4641322073696E676C6520617373657420636F6E7472616374 ; Elt "content" 0x00 })
  `,
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
