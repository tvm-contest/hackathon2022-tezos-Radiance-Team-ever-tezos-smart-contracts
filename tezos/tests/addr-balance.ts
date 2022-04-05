import { TezosToolkit } from '@taquito/taquito'
export class addr_balance {
  // настраиваем ссылку на публичный узел тестовой сети
  private tezos: TezosToolkit

  constructor(rpcUrl: string) {
    this.tezos = new TezosToolkit(rpcUrl)
  }

  //объявляем метод getBalance с входящим параметром address
  public getBalance(address: string): void {
    //Taquito отправляет узлу запрос баланса указанного адреса. Если узел исполнил запрос, скрипт выводит полученное значение в консоль. Если произошла ошибка — выдает «Address not found»
    this.tezos.rpc
      .getBalance(address)
      .then((balance) => console.log('-- Account:', address, ' -- balance: ', balance.toNumber()))
      .catch((e) => console.log('Address not found'))
  }

}
