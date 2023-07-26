from pickletools import StackObject
from threading import local
from webbrowser import get
from algosdk import *
from algosdk.v2client.algod import *
from algosdk.future.transaction import *
from algosdk.atomic_transaction_composer import *
from algosdk.abi import *
# from sandbox import get_accounts
from deploy import create_app, create_asa, delete_app

# import enforcer.contract as enforcer
# import marketplace.contract as marketplace


# client = AlgodClient("a" * 64, "http://localhost:4001")
client = AlgodClient("", "https://testnet-api.algonode.cloud")

ZERO_ADDR = encoding.encode_address(bytes(32))

# Read in ABI description from enforcer
# with open("enforcer/abi.json") as f:
#     enforcer_iface = Interface.from_json(f.read())

# # Read in ABI description from market
# with open("marketplace/abi.json") as f:
#     marketplace_iface = Interface.from_json(f.read())


# Utility method til one is provided
def get_method(i: Interface, name: str) -> Method:
    for m in i.methods:
        if m.name == name:
            return m
    raise Exception("No method with the name {}".format(name))


def dryrun(atc: AtomicTransactionComposer, client: AlgodClient):
    dr_req = create_dryrun(client, atc.gather_signatures())
    dr_resp = client.dryrun(dr_req)
    dr_result = dryrun_results.DryrunResponse(dr_resp)
    for txn in dr_result.txns:
        if txn.app_call_rejected():
            print(txn.app_trace(dryrun_results.StackPrinterConfig(max_value_width=0)))


def get_algo_balance(addr: str):
    ai = client.account_info(addr)
    return ai["amount"]
def get_asa_balance(addr: str, asset_id: int):
    ai = client.account_info(addr)
    # print(ai)
    for a in ai["assets"]:
        if (a["asset-id"] == asset_id):
            return a['amount']
    return -1
    # return ai["amount"]


def main():
    # return ai["amount"]
    # Get accounts
    # accts = get_accounts()
    # myMnemonic = "shrimp exist bicycle useless drama state roof canvas move evoke engine write moment gasp now insect penalty popular adult fame industry alone notice ability grit"
    myMnemonic = "picture captain teach casual matter bonus minimum body gold dolphin material dish describe picnic range quick feed swing toilet jaguar whisper admit pupil abstract predict"
    pk = mnemonic.to_private_key(myMnemonic)
    addr = account.address_from_private_key(pk)

    userMnemonic = "license gasp guard hedgehog rain speak taste response simple aisle empty say layer dutch napkin insane diary museum obscure skin velvet alone only abandon foil"
    user_pk = mnemonic.to_private_key(userMnemonic)
    user_addr = account.address_from_private_key(user_pk)


    amount = 1


    addr_signer = AccountTransactionSigner(pk)
    user_signer = AccountTransactionSigner(user_pk)

    #################
    # Create Royalty Enforcer application
    #################

    # app_id, app_addr = create_app(
    #     client,
    #     addr,
    #     pk,
    #     enforcer.get_approval,
    #     enforcer.get_clear,
    #     global_schema=StateSchema(1, 2),
    #     local_schema=StateSchema(0, 16),
    # )
    # print("Created royalty-enforcment app {} ({})".format(app_id, app_addr))

    #################
    # Create the deposited WETH
    #################

    sp = client.suggested_params()
    atc = AtomicTransactionComposer()
    atc.add_transaction(
        TransactionWithSigner(
            txn=AssetCreateTxn(
                addr,
                sp,
                1000000000000000000,
                18,
                False,
                manager=addr,
                freeze=addr,
                clawback=addr,
                unit_name="ra-ex",
                asset_name="dWETH",
            ),
            signer=addr_signer,
        )
    )
    result = atc.execute(client, 2)
    pti = client.pending_transaction_info(result.tx_ids[0])
    created_token_id = pti["asset-index"]
    print("Created token {}".format(created_token_id))

    # Create the staked WETH token
    sp = client.suggested_params()
    atc = AtomicTransactionComposer()
    atc.add_transaction(
        TransactionWithSigner(
            txn=AssetCreateTxn(
                addr,
                sp,
                1000000000000000000,
                18,
                False,
                manager=addr,
                freeze=addr,
                clawback=addr,
                unit_name="ra-ex",
                asset_name="wstETH",
            ),
            signer=addr_signer,
        )
    )
    result = atc.execute(client, 2)
    pti = client.pending_transaction_info(result.tx_ids[0])
    created_token_id2 = pti["asset-index"]
    print("Created token {}".format(created_token_id2))



    #################
    # App creator opt into app (since we use it later as the owner)
    #################

    # sp = client.suggested_params()
    # atc = AtomicTransactionComposer()
    # atc.add_transaction(
    #     TransactionWithSigner(
    #         txn=ApplicationCallTxn(addr, sp, app_id, OnComplete.OptInOC),
    #         signer=addr_signer,
    #     )
    # )
    # atc.execute(client, 2)

    #################
    # Set the administrator (then revert)
    #################
    # print("Calling get_administrator")
    # sp = client.suggested_params()
    # atc = AtomicTransactionComposer()
    # atc.add_method_call(
    #     app_id,
    #     get_method(enforcer_iface, "get_administrator"),
    #     addr,
    #     sp,
    #     addr_signer,
    # )
    # #TODO: really should just dryrun this 
    # results = atc.execute(client, 2)
    # print("Current admin: {}".format(results.abi_results[0].return_value))

    # print("Calling set_administrator method to set to a new address")
    # sp = client.suggested_params()
    # atc = AtomicTransactionComposer()
    # atc.add_method_call(
    #     app_id,
    #     get_method(enforcer_iface, "set_administrator"),
    #     addr,
    #     sp,
    #     addr_signer,
    #     method_args=[user_addr],
    # )
    # atc.execute(client, 2)

    # print("Calling get_administrator")
    # sp = client.suggested_params()
    # atc = AtomicTransactionComposer()
    # atc.add_method_call(
    #     app_id,
    #     get_method(enforcer_iface, "get_administrator"),
    #     addr,
    #     sp,
    #     addr_signer,
    # )
    # #TODO: really should just dryrun this 
    # results = atc.execute(client, 2)
    # print("Current admin: {}".format(results.abi_results[0].return_value))

    # print("Calling set_administrator method to set back to original creator")
    # sp = client.suggested_params()
    # atc = AtomicTransactionComposer()
    # atc.add_method_call(
    #     app_id,
    #     get_method(enforcer_iface, "set_administrator"),
    #     user_addr,
    #     sp,
    #     user_signer,
    #     method_args=[addr],
    # )
    # atc.execute(client, 2)





    #################
    # Set the royalty policy
    #################

    # print("Calling set_policy method")
    # atc = AtomicTransactionComposer()
    # atc.add_method_call(
    #     app_id,
    #     get_method(enforcer_iface, "set_policy"),
    #     addr,
    #     sp,
    #     addr_signer,
    #     method_args=[1000, royalty_addr],
    # )
    # atc.execute(client, 2)

    #################
    # Get policy from global state of app
    #################

    # print("Calling get_policy method")
    # atc = AtomicTransactionComposer()
    # atc.add_method_call(
    #     app_id,
    #     get_method(enforcer_iface, "get_policy"),
    #     addr,
    #     sp,
    #     addr_signer,
    # )
    # results = atc.execute(client, 2)
    # print("Got: {}".format(results.abi_results[0].return_value))

    # print("Getting the policy from global state")
    # app_info = client.application_info(app_id)
    # state = app_info["params"]["global-state"]
    # print("Policy for app id: {}".format(app_id))
    # for sv in state:
    #     k = base64.b64decode(sv["key"]).decode("utf8")
    #     type = sv["value"]["type"]
    #     val = sv["value"]["uint"]
    #     if type == 1:
    #         val = encoding.encode_address(base64.b64decode(sv["value"]["bytes"]))
    #     print("\t{}: {}".format(k, val))

    #################
    # Create Marketplace Application
    #################

    # print("Creating marketplace app")
    # market_app_id, market_app_addr = create_app(
    #     client,
    #     addr,
    #     pk,
    #     marketplace.get_approval,
    #     marketplace.get_clear,
    #     global_schema=StateSchema(4, 1),
    #     local_schema=StateSchema(0, 16),
    # )
    # print("Created marketplace app: {} ({})".format(market_app_id, market_app_addr))

    #################
    # Get balances after contract setup and before list/sale
    #################


    #################
    # List NFT for sale on marketplace
    #################

    # print("Calling list method on marketplace")

    # # We construct an ATC with no intention of submitting it as is
    # # we're just using it to parse/marshal in the app args
    # atc = AtomicTransactionComposer()
    # atc.add_method_call(
    #     app_id,
    #     get_method(enforcer_iface, "offer"),
    #     addr,
    #     sp,
    #     addr_signer,
    #     [created_nft_id, offered_amount, market_app_addr, 0, ZERO_ADDR],
    # )
    # grp = atc.build_group()

    # # Construct the list app call, passing the offer app call built previously
    # atc = AtomicTransactionComposer()
    # atc.add_method_call(
    #     market_app_id,
    #     get_method(marketplace_iface, "list"),
    #     addr,
    #     sp,
    #     addr_signer,
    #     [created_nft_id, app_id, offered_amount, price, grp[0]],
    # )

    # atc.execute(client, 2)
    # print("Listed asset for sale")

    #################
    # Get offered details
    #################
    # print("Calling get_offer method")
    # atc = AtomicTransactionComposer()
    # atc.add_method_call(
    #     app_id,
    #     get_method(enforcer_iface, "get_offer"),
    #     addr,
    #     sp,
    #     addr_signer,
    #     method_args=[created_nft_id, addr],
    # )
    # results = atc.execute(client, 2)
    # print("Got: {}".format(results.abi_results[0].return_value))

    # print("Getting offer directly from local state")
    # aai = client.account_application_info(addr, app_id)
    # local_state = aai["app-local-state"]["key-value"]
    # for lsv in local_state:
    #     aid = int.from_bytes(base64.b64decode(lsv["key"]), "big")
    #     offer = base64.b64decode(lsv["value"]["bytes"])
    #     auth = encoding.encode_address(offer[:32])
    #     amt = int.from_bytes(offer[32:], "big")
    #     print("Offer from {}".format(addr))
    #     print("\tASA id: {}".format(aid))
    #     print("\tAuth addr: {}".format(auth))
    #     print("\tAmount: {}".format(amt))

    #################
    # User approve token
    #################

    print("User approving tokens")
    atc = AtomicTransactionComposer()
    atc.add_transaction(
        TransactionWithSigner(
            txn=AssetOptInTxn(user_addr, sp, created_token_id), signer=user_signer
        )
    )
    atc.add_transaction(
        TransactionWithSigner(
            txn=AssetOptInTxn(user_addr, sp, created_token_id2), signer=user_signer
        )
    )
    atc.execute(client, 2)
    # print(atc.gather_signatures())
    # for s in atc.gather_signatures():
    #     print(s.__dict__)
    owner_balance1 = get_asa_balance(addr, created_token_id)
    owner_balance2 = get_asa_balance(addr, created_token_id2)

    user_balance1 = get_asa_balance(user_addr, created_token_id)
    user_balance2 = get_asa_balance(user_addr, created_token_id2)

    print()
    # Balances should all match up
    print("Owner Balance token1: {} token2: {}".format(owner_balance1, owner_balance2))
    print("User Balance token1: {} token2: {}".format(user_balance1, user_balance2))



    #################
    # Issuing tokens 
    #################

    print("Issuing token! The manager is issuing dwETH token to the user")
    # issuing token
    atc = AtomicTransactionComposer()
    atc.add_transaction(
        TransactionWithSigner(
            txn=AssetTransferTxn(addr, sp, user_addr, amount, created_token_id, revocation_target=addr), signer=addr_signer
        )
    )
    atc.execute(client, 2)
    owner_balance1 = get_asa_balance(addr, created_token_id)
    owner_balance2 = get_asa_balance(addr, created_token_id2)

    user_balance1 = get_asa_balance(user_addr, created_token_id)
    user_balance2 = get_asa_balance(user_addr, created_token_id2)

    print()
    # Balances should all match up
    print("Owner Balance token1: {} token2: {}".format(owner_balance1, owner_balance2))
    print("User Balance token1: {} token2: {}".format(user_balance1, user_balance2))


    #######################
    # Clawing back tokens #
    #######################

    print("Taking back the deposited tokena and issuing new staked token")
    # issuing token
    atc = AtomicTransactionComposer()
    # clawback token
    atc.add_transaction(
        TransactionWithSigner(
            txn=AssetTransferTxn(addr, sp, addr, amount, created_token_id, revocation_target=user_addr), signer=addr_signer
        )
    )
    atc.add_transaction(
        TransactionWithSigner(
            txn=AssetTransferTxn(addr, sp, user_addr, amount, created_token_id2, revocation_target=addr), signer=addr_signer
        )
    )
    atc.execute(client, 2)

    owner_balance1 = get_asa_balance(addr, created_token_id)
    owner_balance2 = get_asa_balance(addr, created_token_id2)

    user_balance1 = get_asa_balance(user_addr, created_token_id)
    user_balance2 = get_asa_balance(user_addr, created_token_id2)

    print()
    # Balances should all match up
    print("Owner Balance token1: {} token2: {}".format(owner_balance1, owner_balance2))
    print("User Balance token1: {} token2: {}".format(user_balance1, user_balance2))


if __name__ == "__main__":
    main()