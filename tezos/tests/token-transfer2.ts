import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
const acc = require('./acc2.json')
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

  public async transfer(contract: string, sender: string, receiver: string, amount: number) {
    const transfer_params = [
      {
        from_: sender,
        txs: [
          {
            to_: receiver,
            token_id: 0,
            amount: amount
          },
          // {
          //   to_: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6",
          //   token_id: 1,
          //   amount: 22222
          // },
          // {
          //   to_: "tz1Me1MGhK7taay748h4gPnX2cXvbgL6xsYL",
          //   token_id: 0,
          //   amount: 333333
          // }
        ]
      }
    ]
    this.tezos.contract
    .at(contract) //обращаемся к контракту по адресу
    .then((contract) => {
      console.log(`Sending ${amount} from ${sender} to ${receiver}...`)
      //обращаемся к точке входа transfer, передаем ей адреса отправителя и получателя, а также количество токенов для отправки.
      return contract.methods.transfer(transfer_params).send()
    })
    .then((op) => {
      console.log(`Awaiting for ${op.hash} to be confirmed...`)
      return op.confirmation(1).then(() => op.hash) //ждем одно подтверждение сети
    })
    .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`)) //получаем хеш операции
    .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`))
  }




}
