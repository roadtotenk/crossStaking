// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const provider = ethers.provider;
  const [deployer, author, collector] = await ethers.getSigners();
  const EthClient = await ethers.getContractFactory("CCStakingEthClient");
  const ethClient = await EthClient.attach(process.env.EthClientAddressRopsten);
  let ethBalance= await provider.getBalance(process.env.EthClientAddressRopsten);
  let stETHBalance = await ethClient.checkStEthBalance();
  let WETHBalance = await ethClient.checkWrappedETHBalance();
  console.log("ETH balance: ", ethBalance);
  console.log("stETH balance: ", stETHBalance);
  console.log("WETH balance: ", WETHBalance);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });