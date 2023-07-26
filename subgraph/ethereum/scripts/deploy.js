// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const [deployer, author, collector] = await ethers.getSigners();
  const EthClient = await ethers.getContractFactory("CCStakingEthClient");
  const ethClient = await EthClient.deploy(
    process.env.LIDO_ADDRESS_ROPSTEN,
    process.env.WETH_ADDRESS_ROPSTEN,
    process.env.stETH_ADDRESS_ROPSTEN
  );
  await ethClient.deployed();
  console.log("Deployed.")
  console.log("Contract address", ethClient.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });