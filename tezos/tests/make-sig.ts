import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import { Parser, packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
const acc = require('./acc.json');

const provider = 'https://hangzhounet.api.tez.ie'

async function signMsg() {
  const withdraw_addr = "tz1ZNov8u37BXAuvpeXALq1Gxg4to8GNtsP1";
  const withdraw_amt = "300000000000";
  const data: MichelsonData = [{string:withdraw_addr},{int:withdraw_amt}]
  const typ: MichelsonType = [{prim:"address"},{prim:"nat"}]
  const packed = packDataBytes(data, typ);
  console.log(packed);

  try {
    const signer = new InMemorySigner(acc.secret);
    const signature = await signer.sign(packed.bytes);
    console.log('Signature:', signature)
  } catch (err) {
    console.error(err)
  }
}

signMsg()
