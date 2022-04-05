type token_id = nat

type transfer_destination = [@layout:comb] {to_ : address; token_id : token_id; amount : nat}

type transfer = [@layout:comb] {from_ : address; txs : transfer_destination list}

type balance_of_request = [@layout:comb] {owner : address; token_id : token_id}

type balance_of_response = [@layout:comb] {request : balance_of_request; balance : nat}

type balance_of_param = [@layout:comb] {requests : balance_of_request list; callback : (balance_of_response list) contract}

type operator_param = [@layout:comb] {owner : address; operator : address; token_id : token_id}

type update_operator = [@layout:comb] | Add_operator of operator_param | Remove_operator of operator_param

type token_metadata = [@layout:comb] {token_id : token_id; token_info : (string, bytes) map}

type token_metadata_storage = (token_id, token_metadata) big_map

type token_metadata_param = [@layout:comb] {token_ids : token_id list; handler : (token_metadata list) -> unit}

type fa2_entry_points = Transfer of transfer list | Balance_of of balance_of_param | Update_operators of update_operator list

type contract_metadata = (string, bytes) big_map

type transfer_destination_descriptor = [@layout:comb] {to_ : address option; token_id : token_id; amount : nat}

type transfer_descriptor = [@layout:comb] {from_ : address option; txs : transfer_destination_descriptor list}

type transfer_descriptor_param = [@layout:comb] {batch : transfer_descriptor list; operator : address}

type operator_transfer_policy = [@layout:comb] | No_transfer | Owner_transfer | Owner_or_operator_transfer

type owner_hook_policy = [@layout:comb] | Owner_no_hook | Optional_owner_hook | Required_owner_hook

type custom_permission_policy = [@layout:comb] {tag : string; config_api : address option}

type permissions_descriptor = [@layout:comb] {operator : operator_transfer_policy; receiver : owner_hook_policy; sender : owner_hook_policy; custom : custom_permission_policy option}

let fa2_token_undefined = "FA2_TOKEN_UNDEFINED"

let fa2_insufficient_balance = "FA2_INSUFFICIENT_BALANCE"

let fa2_tx_denied = "FA2_TX_DENIED"

let fa2_not_owner = "FA2_NOT_OWNER"

let fa2_not_operator = "FA2_NOT_OPERATOR"

let fa2_operators_not_supported = "FA2_OPERATORS_UNSUPPORTED"

let fa2_receiver_hook_failed = "FA2_RECEIVER_HOOK_FAILED"

let fa2_sender_hook_failed = "FA2_SENDER_HOOK_FAILED"

let fa2_receiver_hook_undefined = "FA2_RECEIVER_HOOK_UNDEFINED"

let fa2_sender_hook_undefined = "FA2_SENDER_HOOK_UNDEFINED"

type operator_storage = ((address * (address * token_id)), unit) big_map

let update_operators (update, storage : update_operator * operator_storage) : operator_storage =
  match update with
    Add_operator op -> Big_map.update (op.owner, (op.operator, op.token_id)) (Some unit) storage
  | Remove_operator op -> Big_map.remove (op.owner, (op.operator, op.token_id)) storage

let validate_update_operators_by_owner (update, updater : update_operator * address) : unit =
  let op =
    match update with
      Add_operator op -> op
    | Remove_operator op -> op in
  if op.owner = updater then unit else failwith fa2_not_owner

let fa2_update_operators (updates, storage : (update_operator list) * operator_storage) : operator_storage =
  let updater = Tezos.sender in
  let process_update =
    (fun (ops, update : operator_storage * update_operator) ->
       let u = validate_update_operators_by_owner (update, updater) in
       update_operators (update, ops)) in
  List.fold process_update updates storage

type operator_validator = (address * address * token_id * operator_storage) -> unit

let make_operator_validator (tx_policy : operator_transfer_policy) : operator_validator =
  let can_owner_tx, can_operator_tx =
    match tx_policy with
      No_transfer -> (failwith fa2_tx_denied : bool * bool)
    | Owner_transfer -> true, false
    | Owner_or_operator_transfer -> true, true in
  (fun (owner, operator, token_id, ops_storage : address * address * token_id * operator_storage) ->
     if can_owner_tx && owner = operator then unit else if not can_operator_tx then failwith fa2_not_owner else if Big_map.mem (owner, (operator, token_id)) ops_storage then unit else failwith fa2_not_operator)

let default_operator_validator : operator_validator =
  (fun (owner, operator, token_id, ops_storage : address * address * token_id * operator_storage) -> if owner = operator then unit else if Big_map.mem (owner, (operator, token_id)) ops_storage then unit else failwith fa2_not_operator)

let validate_operator (tx_policy, txs, ops_storage : operator_transfer_policy * (transfer list) * operator_storage) : unit =
  let validator = make_operator_validator tx_policy in
  List.iter (fun (tx : transfer) -> List.iter (fun (dst : transfer_destination) -> validator (tx.from_, Tezos.sender, dst.token_id, ops_storage)) tx.txs) txs

type get_owners = transfer_descriptor -> (address option) list

type hook_entry_point = transfer_descriptor_param contract

type hook_result = Hook_entry_point of hook_entry_point | Hook_undefined of string

type to_hook = address -> hook_result

let get_owners_from_batch (batch, get_owners : (transfer_descriptor list) * get_owners) : address set =
  List.fold
    (fun (acc, tx : (address set) * transfer_descriptor) ->
       let owners = get_owners tx in
       List.fold
         (fun (acc, o : (address set) * (address option)) ->
            match o with
              None -> acc
            | Some a -> Set.add a acc)
         owners
         acc)
    batch
    (Set.empty : address set)

let validate_owner_hook (p, get_owners, to_hook, is_required : transfer_descriptor_param * get_owners * to_hook * bool) : hook_entry_point list =
  let owners = get_owners_from_batch (p.batch, get_owners) in
  Set.fold
    (fun (eps, owner : (hook_entry_point list) * address) ->
       match to_hook owner with
         Hook_entry_point h -> h :: eps
       | Hook_undefined error -> if is_required then (failwith error : hook_entry_point list) else eps)
    owners
    ([] : hook_entry_point list)

let validate_owner (p, policy, get_owners, to_hook : transfer_descriptor_param * owner_hook_policy * get_owners * to_hook) : hook_entry_point list =
  match policy with
    Owner_no_hook -> ([] : hook_entry_point list)
  | Optional_owner_hook -> validate_owner_hook (p, get_owners, to_hook, false)
  | Required_owner_hook -> validate_owner_hook (p, get_owners, to_hook, true)

let to_receiver_hook : to_hook =
  fun (a : address) ->
    let c : hook_entry_point option = Tezos.get_entrypoint_opt "%tokens_received" a in
    match c with
      Some c -> Hook_entry_point c
    | None -> Hook_undefined fa2_receiver_hook_undefined

let validate_receivers (p, receiver_policy : transfer_descriptor_param * owner_hook_policy) : hook_entry_point list =
  let get_receivers : get_owners = fun (tx : transfer_descriptor) -> List.map (fun (t : transfer_destination_descriptor) -> t.to_) tx.txs in
  validate_owner (p, receiver_policy, get_receivers, to_receiver_hook)

let to_sender_hook : to_hook =
  fun (a : address) ->
    let c : hook_entry_point option = Tezos.get_entrypoint_opt "%tokens_sent" a in
    match c with
      Some c -> Hook_entry_point c
    | None -> Hook_undefined fa2_sender_hook_undefined

let validate_senders (p, sender_policy : transfer_descriptor_param * owner_hook_policy) : hook_entry_point list =
  let get_sender : get_owners = fun (tx : transfer_descriptor) -> [tx.from_] in
  validate_owner (p, sender_policy, get_sender, to_sender_hook)

let get_owner_transfer_hooks (p, descriptor : transfer_descriptor_param * permissions_descriptor) : hook_entry_point list =
  let sender_entries = validate_senders (p, descriptor.sender) in
  let receiver_entries = validate_receivers (p, descriptor.receiver) in
  List.fold (fun (l, ep : (hook_entry_point list) * hook_entry_point) -> ep :: l) receiver_entries sender_entries

let transfers_to_descriptors (txs : transfer list) : transfer_descriptor list =
  List.map
    (fun (tx : transfer) ->
       let txs = List.map (fun (dst : transfer_destination) -> {to_ = Some dst.to_; token_id = dst.token_id; amount = dst.amount}) tx.txs in
       {from_ = Some tx.from_; txs = txs})
    txs

let transfers_to_transfer_descriptor_param (txs, operator : (transfer list) * address) : transfer_descriptor_param = {batch = transfers_to_descriptors txs; operator = operator}

let get_owner_hook_ops_for (tx_descriptor, pd : transfer_descriptor_param * permissions_descriptor) : operation list =
  let hook_calls = get_owner_transfer_hooks (tx_descriptor, pd) in
  match hook_calls with
    [] -> ([] : operation list)
  | h :: t -> List.map (fun (call : hook_entry_point) -> Tezos.transaction tx_descriptor 0mutez call) hook_calls

type ledger = (address, nat) big_map

type single_token_storage = {ledger : ledger; operators : operator_storage; token_metadata : (nat, token_metadata) big_map; total_supply : nat; permissions : permissions_descriptor}

let get_balance_amt (owner, ledger : address * ledger) : nat =
  let bal_opt = Big_map.find_opt owner ledger in
  match bal_opt with
    None -> 0n
  | Some b -> b

let inc_balance (owner, amt, ledger : address * nat * ledger) : ledger =
  let bal = get_balance_amt (owner, ledger) in
  let updated_bal = bal + amt in
  if updated_bal = 0n then Big_map.remove owner ledger else Big_map.update owner (Some updated_bal) ledger

let dec_balance (owner, amt, ledger : address * nat * ledger) : ledger =
  let bal = get_balance_amt (owner, ledger) in
  match Michelson.is_nat (bal - amt) with
    None -> (failwith fa2_insufficient_balance : ledger)
  | Some new_bal -> if new_bal = 0n then Big_map.remove owner ledger else Big_map.update owner (Some new_bal) ledger

let transfer (txs, validate_op, ops_storage, ledger : (transfer_descriptor list) * operator_validator * operator_storage * ledger) : ledger =
  let make_transfer =
    fun (l, tx : ledger * transfer_descriptor) ->
      List.fold
        (fun (ll, dst : ledger * transfer_destination_descriptor) ->
           if dst.token_id <> 0n
           then (failwith fa2_token_undefined : ledger)
           else
             let lll =
               match tx.from_ with
                 None -> ll
               | Some from_ ->
                   let u = validate_op (from_, Tezos.sender, dst.token_id, ops_storage) in
                   dec_balance (from_, dst.amount, ll) in
             match dst.to_ with
               None -> lll
             | Some to_ -> inc_balance (to_, dst.amount, lll))
        tx.txs
        l in
  List.fold make_transfer txs ledger

let get_balance (p, ledger : balance_of_param * ledger) : operation =
  let to_balance =
    fun (r : balance_of_request) ->
      if r.token_id <> 0n
      then (failwith fa2_token_undefined : balance_of_response)
      else
        let bal = get_balance_amt (r.owner, ledger) in
        let response : balance_of_response = {request = r; balance = bal} in
        response in
  let responses = List.map to_balance p.requests in
  Tezos.transaction responses 0mutez p.callback

let validate_token_ids (tokens : token_id list) : unit = List.iter (fun (id : nat) -> if id = 0n then unit else failwith fa2_token_undefined) tokens

let get_owner_hook_ops (tx_descriptors, storage : (transfer_descriptor list) * single_token_storage) : operation list =
  let tx_descriptor_param : transfer_descriptor_param = {batch = tx_descriptors; operator = Tezos.sender} in
  get_owner_hook_ops_for (tx_descriptor_param, storage.permissions)

let fa2_transfer (tx_descriptors, validate_op, storage : (transfer_descriptor list) * operator_validator * single_token_storage) : (operation list) * single_token_storage =
  let new_ledger = transfer (tx_descriptors, validate_op, storage.operators, storage.ledger) in
  let new_storage = {storage with ledger = new_ledger} in
  let ops = get_owner_hook_ops (tx_descriptors, storage) in
  ops, new_storage

let fa2_main (param, storage : fa2_entry_points * single_token_storage) : (operation list) * single_token_storage =
  match param with
    Transfer txs ->
      let tx_descriptors = transfers_to_descriptors txs in
      fa2_transfer (tx_descriptors, default_operator_validator, storage)
  | Balance_of p ->
      let op = get_balance (p, storage.ledger) in
      [op], storage
  | Update_operators updates ->
      let new_ops = fa2_update_operators (updates, storage.operators) in
      let new_storage = {storage with operators = new_ops} in
      ([] : operation list), new_storage

type mint_burn_tx = [@layout:comb] {owner : address; amount : nat}

type mint_burn_tokens_param = mint_burn_tx list

type token_manager = Mint_tokens of mint_burn_tokens_param | Burn_tokens of mint_burn_tokens_param

let get_total_supply_change (txs : mint_burn_tx list) : nat = List.fold (fun (total, tx : nat * mint_burn_tx) -> total + tx.amount) txs 0n

let mint_params_to_descriptors (txs : mint_burn_tokens_param) : transfer_descriptor list =
  let param_to_destination = fun (p : mint_burn_tx) -> {to_ = Some p.owner; token_id = 0n; amount = p.amount} in
  let destinations : transfer_destination_descriptor list = List.map param_to_destination txs in
  [{from_ = (None : address option); txs = destinations}]

let burn_params_to_descriptors (txs : mint_burn_tokens_param) : transfer_descriptor list =
  let param_to_descriptor = fun (p : mint_burn_tx) -> {from_ = Some p.owner; txs = [{to_ = (None : address option); token_id = 0n; amount = p.amount}]} in
  List.map param_to_descriptor txs

let mint_tokens (txs, storage : mint_burn_tokens_param * single_token_storage) : (operation list) * single_token_storage =
  let tx_descriptors = mint_params_to_descriptors txs in
  let nop_operator_validator = fun (p : address * address * token_id * operator_storage) -> unit in
  let ops, new_s1 = fa2_transfer (tx_descriptors, nop_operator_validator, storage) in
  let supply_change = get_total_supply_change txs in
  let new_s2 = {new_s1 with total_supply = storage.total_supply + supply_change} in
  ops, new_s2

let burn_tokens (txs, storage : mint_burn_tokens_param * single_token_storage) : (operation list) * single_token_storage =
  let tx_descriptors = burn_params_to_descriptors txs in
  let nop_operator_validator = fun (p : address * address * token_id * operator_storage) -> unit in
  let ops, new_s1 = fa2_transfer (tx_descriptors, nop_operator_validator, storage) in
  let supply_change = get_total_supply_change txs in
  let new_supply_opt = Michelson.is_nat (storage.total_supply - supply_change) in
  let new_supply =
    match new_supply_opt with
      None -> (failwith fa2_insufficient_balance : nat)
    | Some s -> s in
  let new_s2 = {new_s1 with total_supply = new_supply} in
  ops, new_s2

let token_manager (param, s : token_manager * single_token_storage) : (operation list) * single_token_storage =
  match param with
    Mint_tokens txs -> mint_tokens (txs, s)
  | Burn_tokens txs -> burn_tokens (txs, s)

type simple_admin = Set_admin of address | Confirm_admin of unit | Pause of bool

type simple_admin_storage = {admin : address; pending_admin : address option; paused : bool}

let set_admin (new_admin, s : address * simple_admin_storage) : simple_admin_storage = {s with pending_admin = Some new_admin}

let confirm_new_admin (s : simple_admin_storage) : simple_admin_storage =
  match s.pending_admin with
    None -> (failwith "NO_PENDING_ADMIN" : simple_admin_storage)
  | Some pending -> if Tezos.sender = pending then {s with pending_admin = (None : address option); admin = Tezos.sender} else (failwith "NOT_A_PENDING_ADMIN" : simple_admin_storage)

let pause (paused, s : bool * simple_admin_storage) : simple_admin_storage = {s with paused = paused}

let fail_if_not_admin (a : simple_admin_storage) : unit = if sender <> a.admin then failwith "NOT_AN_ADMIN" else unit

let fail_if_paused (a : simple_admin_storage) : unit = if a.paused then failwith "PAUSED" else unit

let simple_admin (param, s : simple_admin * simple_admin_storage) : (operation list) * simple_admin_storage =
  match param with
    Set_admin new_admin ->
      let u = fail_if_not_admin s in
      let new_s = set_admin (new_admin, s) in
      (([] : operation list), new_s)
  | Confirm_admin u ->
      let new_s = confirm_new_admin s in
      (([] : operation list), new_s)
  | Pause paused ->
      let u = fail_if_not_admin s in
      let new_s = pause (paused, s) in
      (([] : operation list), new_s)

type single_asset_storage = {admin : simple_admin_storage; assets : single_token_storage; metadata : contract_metadata}

type single_asset_param = Assets of fa2_entry_points | Admin of simple_admin | Tokens of token_manager

let single_asset_main (param, s : single_asset_param * single_asset_storage) : (operation list) * single_asset_storage =
  match param with
    Admin p ->
      let ops, admin = simple_admin (p, s.admin) in
      let new_s = {s with admin = admin} in
      (ops, new_s)
  | Tokens p ->
      let u1 = fail_if_not_admin s.admin in
      let ops, assets = token_manager (p, s.assets) in
      let new_s = {s with assets = assets} in
      (ops, new_s)
  | Assets p ->
      let u2 = fail_if_paused s.admin in
      let ops, assets = fa2_main (p, s.assets) in
      let new_s = {s with assets = assets} in
      (ops, new_s)
