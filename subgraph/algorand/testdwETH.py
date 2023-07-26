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

    user_addr = "JTCQW5TV5OY5HIX6O7ER5LKIC74UJYU2ORYDRHYXRGGVOJJK4ALDUZSMXI"


    amount = 100


    addr_signer = AccountTransactionSigner(pk)

    created_token_id = 91208285
    created_token_id2 = 91208322

    sp = client.suggested_params()
   


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



if __name__ == "__main__":
    main()