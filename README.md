# Everscale Tezos Bridge Smartcontracts

## Tezos to Everscale Bridge architecture
![Tezos to Everscale Bridge architecture](BridgeTezosEver.png)
https://docs.google.com/drawings/d/1uDfCchXOzKv1HqMH3TfYMlF3FKw-ewLjQi3cOq_jjH4/edit?usp=sharing

## Everscale to Tezos Bridge architecture
![Everscale to Tezos Bridge architecture](BridgeEverTezos.png)
https://docs.google.com/drawings/d/1CMoL4vS-Ppza8UB9ypat9BUnHTzVQdbofgH1aPEjrnw/edit?usp=sharing

## Description
For bridge between Everscale and Tezos following financial assets are used:
 * FA1.2 & FA2 token standard - for Tezos https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md
 * TIP3 v5 token standard - for Everscale https://github.com/broxus/ton-eth-bridge-token-contracts

Tezos smartcontracts:
 - [`tezos`](tezos/) - contracts code defined in [LIGO](https://ligolang.org/),
   smart-contract language for Tezos.
   - [`tezos/fa2_single_asset_with_hooks_assembl.mligo`](tezos/fa2_single_asset_with_hooks_assembl.mligo) - standart FA2 single asset token smartcontract from https://github.com/oxheadalpha/smart-contracts/tree/master/single_asset
     this contract use onchain token metadata storage and have 8 interact endpoints:
     - `update_operators`  https://better-call.dev/hangzhou2net/KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu/interact?entrypoint=update_operators with two options:
       * `add_operator`
       * `remove_operator`
     - `transfer`  https://better-call.dev/hangzhou2net/KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu/interact?entrypoint=transfer
     - `set_admin`  https://better-call.dev/hangzhou2net/KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu/interact?entrypoint=set_admin
     - `confirm_admin`  https://better-call.dev/hangzhou2net/KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu/interact?entrypoint=confirm_admin
     - `pause`  https://better-call.dev/hangzhou2net/KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu/interact?entrypoint=pause
     - `mint_tokens`  https://better-call.dev/hangzhou2net/KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu/interact?entrypoint=mint_tokens
     - `burn_tokens`  https://better-call.dev/hangzhou2net/KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu/interact?entrypoint=burn_tokens
     - `balance_of`  https://better-call.dev/hangzhou2net/KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu/interact?entrypoint=balance_of for onchain check balance by other smartcontracts

   - [`tezos/fa2_vault.ligo`](tezos/fa2_vault.ligo) - vault smartcontract for storage and delivery FA2 single asset token with bridge interaction, have 3 interact endpoints:
     - `balance_of_callback` https://better-call.dev/hangzhou2net/KT1RAWE7SBg7NH7UuduktHjJv7gXhkEdf5ya/interact?entrypoint=balance_of_callback
     - `deposit_to_vault` https://better-call.dev/hangzhou2net/KT1RAWE7SBg7NH7UuduktHjJv7gXhkEdf5ya/interact?entrypoint=deposit_to_vault
     - `withdraw_from_vault` https://better-call.dev/hangzhou2net/KT1RAWE7SBg7NH7UuduktHjJv7gXhkEdf5ya/interact?entrypoint=withdraw_from_vault

   - smartcomtracts implemrtation:
     - [`tDEX_token_FA2=KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu`](https://better-call.dev/hangzhou2net/KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu/tokens)
     - [`tDEX_vault=KT1RAWE7SBg7NH7UuduktHjJv7gXhkEdf5ya`](https://better-call.dev/hangzhou2net/KT1RAWE7SBg7NH7UuduktHjJv7gXhkEdf5ya/operations)

     - [`tUSDT_token_FA2=KT1FgNW2AcxkZRRvXkyTT1y1HiFH5tpHsAB6`](https://better-call.dev/hangzhou2net/KT1FgNW2AcxkZRRvXkyTT1y1HiFH5tpHsAB6/tokens)
     - [`tUSDT_vault=KT1Hiiov5JP22VdxJKieXwc43vtfUU88t6AG`](https://better-call.dev/hangzhou2net/KT1Hiiov5JP22VdxJKieXwc43vtfUU88t6AG/operations)

     - [`tUSDC_token_FA2=KT1LkEFg8ungGrHGrvy8ECzBGLvR42dtBq6r`](https://better-call.dev/hangzhou2net/KT1LkEFg8ungGrHGrvy8ECzBGLvR42dtBq6r/tokens)
     - [`tUSDC_vault=KT1EBJtioejgCrApgHxoBKRC18xYxa7MAYaf`](https://better-call.dev/hangzhou2net/KT1EBJtioejgCrApgHxoBKRC18xYxa7MAYaf/operations)

     - [`tDAI_token_FA2=KT1VNqjuC87A83fWBk5epnZvmeffZDTnUivR`](https://better-call.dev/hangzhou2net/KT1VNqjuC87A83fWBk5epnZvmeffZDTnUivR/tokens)
     - [`tDAI_vault=KT1KmAdV3rKZwjW2atrY6UJk2T1F9J52PrQd`](https://better-call.dev/hangzhou2net/KT1KmAdV3rKZwjW2atrY6UJk2T1F9J52PrQd/operations)

 Everscale smartcontracts:
  - [`everscale`](everscale/src) - contracts code defined in [Solidity](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md),
    smart-contract language for Everscale.
    - [`everscale/src/Bridge.sol`](everscale/src/Bridge.sol) - contract is onchain storage of bridge owner, bridge configurations, bridge relay keys and some of it's public methods are:
      - `setConfigurations`  
      - `setKeys`  
      - `getInfo() return (_owner, _configurations, _keys)`  

    - [`everscale/src/EverscaleEventConfiguration.sol`](everscale/src/EverscaleEventConfiguration.sol) - contract is root for deploy everscale event smartcontracts and some of it's public methods are:
      - `deployEvent`
      - `deriveEventAddress`
      - `eventConfirmedCallback`

    - [`everscale/src/TezosEventConfiguration.sol`](everscale/src/TezosEventConfiguration.sol) - contract is root for deploy tezos event smartcontracts and some of it's public methods are:
      - `deployEvent`
      - `deriveEventAddress`
      - `eventConfirmedCallback`

    - [`everscale/src/EverscaleTransferTokenEvent.sol`](everscale/src/EverscaleTransferTokenEvent.sol) - contract is everscale event smartcontracts and some of it's public methods are:
      - `confirm`
      - `reject`

    - [`everscale/src/TezosTransferTokenEvent.sol`](everscale/src/TezosTransferTokenEvent.sol) - contract is tezos event smartcontracts and some of it's public methods are:
      - `confirm`
      - `reject`

    - [`everscale/src/TransferTokenProxy.sol`](everscale/src/TransferTokenProxy.sol) - contract is proxy for interact with TIP3 v5 token root  and some of it's public methods are:
      - `transferTokenCallback`
      - `burnTokenCallback`

    - smart-contracts implemetation:
    ```
    eDEX_TokenRoot=0:0d9b85d42c4824fb8b92ffc122168d92b431b6814686fa04af25277a987683a5
    edex_transfer_TokenProxy=0:098aff3c60b1b8952621927966fd76b67912ca4a5ddf14acd94c00e6bafdee7f
    edex_tezos_EventConfig=0:3f908f63c6dcdef9d56ee43c1398dc0896dc0da107683ceea846a4b39727fda0
    edex_everscale_EventConfig=0:c9304457553187fd40ff5ca7bf623e13cc03a39f6c47172c70694e536fb3729f

    eUSDT_TokenRoot=0:1a74c51d2fe8929d2f88537e53106a8114f6ad7440b4dc984679e67d14485dab
    usdt_transfer_TokenProxy=0:932b59c2f6a44fc3e7f01c2770f769370884ae85e16e713ee99c74f853c2f509
    usdt_tezos_EventConfig=0:0f3801d5ba4924d94e2a2fb77fdbf9281f427cb749fbbc16b3b53ddcb6e4b188
    usdt_everscale_EventConfig=0:c4bc9335cd7ef5f34f6ae193fea10fc568f61f5db2f8a4700c3a356233e438b2

    eUSDC_TokenRoot=0:ee38d57760224404e447cfc730a349b483621511a802808ababb97136310d979
    usdc_transfer_TokenProxy=0:db7281fffb6c685586b20a234ed56d20a75deeda2df7a158a6feb6585e11f05f
    usdc_tezos_EventConfig=0:ad3e25acfc63880c82667cc060cfe459a65c2ed378bacbc734d3d7d141204366
    usdc_everscale_EventConfig=0:b7fbbdb73713abdc19cf946bd4e512bf7171d1a30a3c6e92a097c5afca503935

    eDAI_TokenRoot=0:dc39256947eb38903abf24b2f4f0602e520b9b3a873b2537e4e658421f24f0ee
    dai_transfer_TokenProxy=0:394e09a63edcfea56d608a4778bdecfb1a4b13c5971792b0ba1633f6250fece7
    dai_tezos_EventConfig=0:920a7b4adde7eeb4e6503b081b44a0c9c992c94605851e0681891559bd9dec63
    dai_everscale_EventConfig=0:5d03480d862d62a7af42c4c791cda2287f6bd53c04d612922b368a08964390ec
   ```
