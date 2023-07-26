require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
const path = require("path");
require("dotenv").config({path: "./.env"});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  solidity: "0.8.9",


  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: [process.env.RINKEBY_PK]
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: [process.env.GOERLI_PK]
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: [process.env.ROPSTEN_PK]
    }
  }
};