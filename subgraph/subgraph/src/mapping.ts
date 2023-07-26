import { BigInt } from "@graphprotocol/graph-ts"
import {
  CCStakingEthClient,
  OwnershipTransferred,
  Staked,
  Unwrapped,
  Withdrawn
} from "../generated/CCStakingEthClient/CCStakingEthClient"
import { StEthPool, Tx } from "../generated/schema"

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let pool = StEthPool.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!pool) {
    pool = new StEthPool(event.transaction.from.toHex())
    pool.cumStaked = BigInt.fromI32(0);
    pool.cumUnwrapped = BigInt.fromI32(0);
    pool.cumWithdrawal= BigInt.fromI32(0);
    pool.save()
  }

  // Entities can be written to the store with `.save()`
  pool.save()

}

export function handleStaked(event: Staked): void {
  let pool = StEthPool.load(event.transaction.from.toHex())
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!pool ) {
    // shouldn't be here
  } else {
    pool.cumStaked = pool.cumStaked + event.params.amount
  }

  let tx = Tx.load(event.block.timestamp.toHexString())
  if (!tx) {
    tx = new Tx(event.block.timestamp.toHexString());
    tx.staked = event.params.amount;
    tx.withdrawal = BigInt.fromI32(0);
    tx.time = event.block.timestamp;
    tx.stEthPool = event.transaction.from.toHex();
    tx.save()
  }
}

export function handleUnwrapped(event: Unwrapped): void {
  let pool = StEthPool.load(event.transaction.from.toHex())
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!pool ) {
    // shouldn't be here
  } else {
    pool.cumUnwrapped = pool.cumUnwrapped + event.params.amount
  }
}

export function handleWithdrawn(event: Withdrawn): void {
  let pool = StEthPool.load(event.transaction.from.toHex())
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!pool ) {
    // shouldn't be here
  } else {
    pool.cumWithdrawal = pool.cumWithdrawal + event.params.amount
  }
  let tx = Tx.load(event.block.timestamp.toHexString())
  if (!tx) {
    tx = new Tx(event.block.timestamp.toHexString());
    tx.staked = BigInt.fromI32(0);
    tx.withdrawal= event.params.amount;
    tx.time = event.block.timestamp;
    tx.stEthPool = event.transaction.from.toHex();
    tx.save()
  }
}