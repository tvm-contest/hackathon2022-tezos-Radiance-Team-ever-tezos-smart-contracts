import { token_withdraw } from './token-withdraw'

const RPC_URL = 'https://hangzhounet.api.tez.ie'
const CONTRACT = 'KT1RAWE7SBg7NH7UuduktHjJv7gXhkEdf5ya' //адрес опубликованного контракта
const SIGN_DATA = '0507070a00000016000096b0db6796bf2b43962095e78975207d3584444c0080c0f9decfae01' //публичный адрес отправителя — возьмите его из acc.json
const SIGN_CORE = 'sighWGAC8LyxRGpYBX4B2thMQLT5YEKLiDn686cqNQiwWLWjEZRb8khAkBXsyU2NQSnw8MwymwivggGA3DuJAQorJRw8Ee7m' //публичный адрес получателя — возьмите его из кошелька Tezos, который вы создали
new token_withdraw(RPC_URL).withdraw(CONTRACT, SIGN_DATA, SIGN_CORE)
