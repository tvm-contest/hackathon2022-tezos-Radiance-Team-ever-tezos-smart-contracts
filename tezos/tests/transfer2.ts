import { token_transfer } from './token-transfer2'

const RPC_URL = 'https://hangzhounet.api.tez.ie'
const CONTRACT = 'KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu' //адрес опубликованного контракта
const SENDER = 'tz1ZNov8u37BXAuvpeXALq1Gxg4to8GNtsP1' //публичный адрес отправителя — возьмите его из acc.json
const RECEIVER = 'tz1hvKQyP7HvHP3iBD3WqMumLtJKfQ1bihkx' //публичный адрес получателя — возьмите его из кошелька Tezos, который вы создали
const AMOUNT = 10000000000000 //количество токенов для отправки. Можете ввести другое число
new token_transfer(RPC_URL).transfer(CONTRACT, SENDER, RECEIVER, AMOUNT)
