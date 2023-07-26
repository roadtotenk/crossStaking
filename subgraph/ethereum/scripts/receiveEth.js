// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');

async function main() {
  const [deployer, author, collector] = await ethers.getSigners();
  const EthClient = await ethers.getContractFactory("CCStakingEthClient");
  const ethClient = await EthClient.attach(process.env.EthClientAddressRopsten);
  const ethClientAsDeployer = ethClient.connect(deployer);

  
  const tx = await ethClientAsDeployer.receiveEther({value:1000000});
  const receipt = await tx.wait();
  console.log("tx", tx);
  console.log("receipt", receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });