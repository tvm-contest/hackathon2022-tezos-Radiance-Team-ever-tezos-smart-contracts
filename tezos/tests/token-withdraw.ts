import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
const acc = require('./acc.json')
export class token_transfer {
  // настраиваем ссылку на публичный узел тестовой сети
  private tezos: TezosToolkit
  private initialization;
  rpcUrl: string

  constructor(rpcUrl: string) {
    this.tezos = new TezosToolkit(rpcUrl)
    this.rpcUrl = rpcUrl
    this.initialization = this.init();
  }

  async init() {
    this.tezos.setSignerProvider(await InMemorySigner.fromSecretKey(acc.secret))
  }

  // объявляем метод transfer, который принимает параметры:
  //
  // 1) contract — адрес контракта;
  // 2) sender — адрес отправителя;
  // 3) receiver — адрес получателя;
  // 4) amount — количество токенов для отправки.

  public async withdraw(contract: string, sign_data: string, sign_core: string) {
    const withdraw_params = {
        signed_core: sign_core,
        signed_data: sign_data,
      }

    this.tezos.contract
    .at(contract) //обращаемся к контракту по адресу
    .then((contract) => {
      console.log(`Withdraw from ${contract} ...`)
      //обращаемся к точке входа transfer, передаем ей адреса отправителя и получателя, а также количество токенов для отправки.
      return contract.methods.withdraw_from_vault(withdraw_params).send()
    })
    .then((op) => {
      console.log(`Awaiting for ${op.hash} to be confirmed...`)
      return op.confirmation(1).then(() => op.hash) //ждем одно подтверждение сети
    })
    .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`)) //получаем хеш операции
    .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`))
  }




}
