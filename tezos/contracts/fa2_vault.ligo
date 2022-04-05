type token_id is nat

type balance_of_request is [@layout:comb] record [
    owner : address;
    token_id : token_id;
]

type balance_of_response is [@layout:comb] record [
    request : balance_of_request;
    balance : nat;
]

type balance_of_param is [@layout:comb] record [
    requests : list (balance_of_request);
    callback : contract (list (balance_of_response));
]

type deposit_to_param is [@layout:comb] record [
    requests : list (balance_of_request);
    amt_for_deposit : nat;
    everscale_receiver : bytes;
]

type transfer_dst_t is [@layout:comb] record [
  to_                     : address;
  token_id                : token_id;
  amount                  : nat;
]

type transfer_t is [@layout:comb] record [
  from_                   : address;
  txs                     : list(transfer_dst_t);
]

type transfers_t is list(transfer_t)

type fa2_transfer_t  is FA2_transfer of transfers_t

type withdraw_signed_obj is [@layout:comb] record [
  signed_core             : signature;
  signed_data             : bytes
]

type withdraw_tuple is address * nat

type storage is record [
  request : list (balance_of_request);
  responce : list (balance_of_response);
  deposit_amt : nat;
  deposit_addr_from : address;
  deposit_everscale_dest : bytes;
  withdraw_sig_check : bool;
  withdraw_addr : address;
  withdraw_amt : nat;
]

type parameter is
  Deposit_to_vault of deposit_to_param
| Balance_of_callback of list (balance_of_response)
| Withdraw_from_vault of withdraw_signed_obj

type return is list (operation) * storage

const fa2_contract_address : address = ("KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu": address);

const withdraw_public_key : key = ("edpkvZs31XvfRjqDAkcCLVLxLbvE8aYMpDCTKf2yaFdeBk7YhmRjne": key);

const current_addr : address = Tezos.self_address;

const balance_of_entrypoint : contract(balance_of_param) =
    case (Tezos.get_entrypoint_opt("%balance_of", fa2_contract_address) : option(contract(balance_of_param))) of [
    | None -> (failwith("Token is not found") : contract(balance_of_param))
    | Some(entrypoint) -> entrypoint
    ]

function get_callback_entrypoint (const addr : address) is
block {
  const entrypoint : option (contract (list (balance_of_response)))
  = Tezos.get_entrypoint_opt ("%balance_of_callback", addr)
} with
    case entrypoint of [
      Some (contract) -> contract
    | None -> (failwith ("The entrypoint does not exist") : contract (list (balance_of_response)))
    ]

function get_transfer_entrypoint (const addr : address) is
block {
  const entrypoint : option (contract (list (balance_of_response)))
  = Tezos.get_entrypoint_opt ("%transfer", addr)
} with
    case entrypoint of [
      Some (contract) -> contract
    | None -> (failwith ("The entrypoint does not exist") : contract (list (balance_of_response)))
    ]

function get_fa2_token_transfer_entrypoint(
  const token           : address)
                        : contract(fa2_transfer_t) is
  case (Tezos.get_entrypoint_opt("%transfer", token) : option(contract(fa2_transfer_t))) of [
  | Some(contr) -> contr
  | None        -> (failwith("The entrypoint does not exist") : contract(fa2_transfer_t))
  ]

function wrap_fa2_transfer_trx(
  const from_           : address;
  const to_             : address;
  const amt             : nat;
  const id              : token_id)
                        : fa2_transfer_t is
  FA2_transfer(
    list [
      record [
        from_ = from_;
        txs   = list [
          record [
            to_      = to_;
            token_id = id;
            amount   = amt;
          ]
        ];
      ]
    ]
  )

function transfer_fa2(
  const from_           : address;
  const to_             : address;
  const amt             : nat;
  const token           : address;
  const id              : token_id)
                        : operation is
  Tezos.transaction(
    wrap_fa2_transfer_trx(from_, to_, amt, id),
    0mutez,
    get_fa2_token_transfer_entrypoint(token)
  )

function deposit_to_vault (const dtp : deposit_to_param; const store : storage): return is
block {
    const clb_entrypoint = get_callback_entrypoint (current_addr);
    const param : balance_of_param = record [requests = dtp.requests;callback = clb_entrypoint;];
    const op : operation = Tezos.transaction (param, 0tez, balance_of_entrypoint);
    const ops : list (operation) = list [op]
  } with (ops, store with record [request = dtp.requests; deposit_amt = dtp.amt_for_deposit; deposit_addr_from = Tezos.sender; deposit_everscale_dest = dtp.everscale_receiver])

function balance_of_callback (const res : list (balance_of_response); const store : storage) : return is
block {
    const head : option (balance_of_response) = List.head_opt (res);
    const unopt_head : balance_of_response = Option.unopt (head);
    const head_bal : nat = unopt_head.balance;
    if head_bal < store.deposit_amt then failwith ("Balance not enought") else skip;
    const op : operation = transfer_fa2( store.deposit_addr_from, current_addr, store.deposit_amt, fa2_contract_address, 0n);
    const ops : list (operation) = list [op]
} with (ops, store with record [responce = res])

function check_signature
    (const pk     : key;
     const signed : signature;
     const msg    : bytes) : bool
  is Crypto.check (pk, signed, msg)

function bytes_to_tuple (const a: bytes) : option (withdraw_tuple) is (Bytes.unpack (a) : option (withdraw_tuple))

function withdraw_from_vault (const wo : withdraw_signed_obj; const store : storage) : return is
block {
    const check_result : bool = check_signature( withdraw_public_key, wo.signed_core, wo.signed_data);
    if check_result = False then failwith ("Check signature not success") else skip;
    const wt : option (withdraw_tuple) =  bytes_to_tuple (wo.signed_data);
    const unopt_wt : withdraw_tuple = Option.unopt (wt);
    const op : operation = transfer_fa2( current_addr, unopt_wt.0, unopt_wt.1, fa2_contract_address, 0n);
    const ops : list (operation) = list [op]
} with (ops, store with record [withdraw_sig_check = check_result; withdraw_addr = unopt_wt.0; withdraw_amt = unopt_wt.1])

function main (const action : parameter; const store : storage): return is
  case action of [
    Deposit_to_vault (q) -> deposit_to_vault (q, store)
  | Balance_of_callback (r) -> balance_of_callback (r, store)
  | Withdraw_from_vault (w) -> withdraw_from_vault (w, store)
  ]
