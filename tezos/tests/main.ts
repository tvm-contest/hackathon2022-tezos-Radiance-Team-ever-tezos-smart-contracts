import { App } from './app'
//импортируем Tx.ts
import { Tx } from './tx'
//меняем RPC-ссылку из мейннета на тестовую сеть. Не пугайтесь smartpy в ссылке — это просто адрес сервера
const RPC_URL = 'https://hangzhounet.api.tez.ie'
const ADDRESS = 'tz1ZNov8u37BXAuvpeXALq1Gxg4to8GNtsP1'
//вызываем функцию Tx, передаем ей ссылку на тестовую сеть и просим активировать аккаунт
new Tx(RPC_URL).activateAccount()
