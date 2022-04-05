import { addr_balance } from './addr-balance'

const RPC_URL = 'https://hangzhounet.api.tez.ie'
const ADDRESS_T = "tz1ZNov8u37BXAuvpeXALq1Gxg4to8GNtsP1"
const ADDRESS_Y = "tz1fBnrqSwg9s7foTDBXmnJpg9VYQjqosNjQ"
new addr_balance(RPC_URL).getBalance(ADDRESS_T)
new addr_balance(RPC_URL).getBalance(ADDRESS_Y)
