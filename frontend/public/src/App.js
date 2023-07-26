//C3 Integrations
//import { C3RequestOp, C3Sdk, CEDepositRequest, connectC3 } from "c3-sdk/src/C3Sdk"
//import { Signer } from "c3-sdk/src/Signer.ts"

// Import react components
import { useState, useEffect } from 'react';

// Import UI Components
import { Header, Container, Button, Input } from 'semantic-ui-react';

import { createClient } from 'urql';

// Import the SkynetClient and a helper
// import { SkynetClient } from 'skynet-js';

// We'll define a portal to allow for developing on localhost.
// When hosted on a skynet portal, SkynetClient doesn't need any arguments.
// const portal = window.location.hostname === 'localhost' ? 'https://siasky.net' : undefined;

// Initiate the SkynetClient
// const client = new SkynetClient(portal);

/*****/

function App() {
  // Define app state helpers
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  // choose a data domain for saving files in MySky
  //const dataDomain = 'localhost';

  /*****/

  // On initial run, start initialization of MySky
  useEffect(() => {

  }, []);

  // Connecting Wallet to Frontend
  const handleConnect = async (event) => {
    event.preventDefault();
    console.log('begin login attempt');
    setLoading(true);
    // Check that AlgoSigner is installed
    if (typeof AlgoSigner !== 'undefined') {
      // connects to the browser AlgoSigner instance
      window.AlgoSigner.connect()
        // finds the TestNet accounts currently in AlgoSigner
        .then(() => window.AlgoSigner.accounts({
          ledger: 'TestNet'
        }))
        .then((accountData) => {
          // the accountData object should contain the Algorand addresses from TestNet that AlgoSigner currently knows about
          console.log(accountData);
          window.document.getElementById("account").innerText = "Account: " +
            accountData[0].address.substring(0, 4) + " ... " + accountData[0].address.substring(accountData[0].address.length - 4);
          sessionStorage.setItem('address', accountData[0].address);
          setLoggedIn(true);
        })
        .catch((e) => {
          // handle errors and perform error cleanup here
          console.error(e);
          setLoggedIn(false);
        });
    }
  }

  /* Sending Coins */
  const handleSendAlgo = async (event) => {
    event.preventDefault();
    console.log('begin send attempt');
    setLoading(true);

    const algosdk = require('algosdk');

    const baseServer = 'https://testnet-algorand.api.purestake.io/ps2'
    const port = '';
    const token = {
      'X-API-Key': 'BjPgZDZX4T3ZjlUzyEl7H9ZYK5TtZbyq72ua1r63'
    }

    const algodclient = new algosdk.Algodv2(token, baseServer, port);

    let params = await algodclient.getTransactionParams().do();

    const receiver = "E2YB673D7KLS4363SC77AQQTXYAJPQNTA2QMUVYAJZVCKVKU6VBZRYK4WQ";
    const enc = new TextEncoder();
    const note = enc.encode("Hello World");
    let amount = 1000000; // equals 1 ALGO

    let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sessionStorage.getItem('address'),
      to: receiver,
      amount: amount,
      note: note,
      suggestedParams: params
    });

    // Use the AlgoSigner encoding library to make the transactions base64
    let txn_b64 = window.AlgoSigner.encoding.msgpackToBase64(txn.toByte());

    let txnID = await window.AlgoSigner.signTxn([{ txn: txn_b64 }]);

    console.log(txnID[0].blob);

    window.AlgoSigner.send({
      ledger: 'TestNet',
      tx: txnID[0].blob // the unique blob representing the signed transaction
    }).then((d) => {
      console.log("send successful")
      console.log(d);
    })
      .catch((e) => {
        console.error(e);
      });
    setLoading(false);

  }

  const handleSendWeth = async (event) => {
    event.preventDefault();
    console.log('begin send attempt');

    const algosdk = require('algosdk');
    const baseServer = 'https://testnet-algorand.api.purestake.io/ps2'
    const port = '';
    const token = {
      'X-API-Key': 'BjPgZDZX4T3ZjlUzyEl7H9ZYK5TtZbyq72ua1r63'
    }

    const algodclient = new algosdk.Algodv2(token, baseServer, port);

    const algoMneu = "picture captain teach casual matter bonus minimum body gold dolphin material dish describe picnic range quick feed swing toilet jaguar whisper admit pupil abstract predict";
    const dethAccount = algosdk.mnemonicToSecretKey(algoMneu);

    let params = await algodclient.getTransactionParams().do();
    const receiver = "FXAHTSPWE3LR4JDEE5RUCZF2LF44VBVXVFC3UUQGDZQEQVIZW4PHJ7QDXA";
    const enc = new TextEncoder();
    const note = enc.encode("Depositing wETH");
    let amount = parseFloat(window.document.getElementById('wethIn').value) * 10 ** 8;
    let wethID = 90650110;
    let dethID = 91208285;

    let txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      assetIndex: wethID,
      from: sessionStorage.getItem('address'),
      to: receiver,
      amount: amount,
      note: note,
      type: 'axfer',  // ASA Transfer
      suggestedParams: params
    });

    let txn1_b64 = window.AlgoSigner.encoding.msgpackToBase64(txn1.toByte());
    let signedTx1 = await window.AlgoSigner.signTxn([{ txn: txn1_b64 }]);

    window.AlgoSigner.send({
      ledger: 'TestNet',
      tx: signedTx1[0].blob // the unique blob representing the signed transaction
    }).then((d) => {
      console.log("send successful")
      //console.log(d);
    })
      .catch((e) => {
        console.error(e);
      });

    params = await algodclient.getTransactionParams().do();
    let txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      assetIndex: dethID,
      from: receiver,
      to: sessionStorage.getItem('address'),
      amount: amount,
      type: 'axfer',  // ASA Transfer
      suggestedParams: params
    });
    let signed = txn2.signTxn(dethAccount.sk)
    let tx = await algodclient.sendRawTransaction(signed).do();
    console.log("Transaction : " + tx.txId);
    // Wait for transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodclient, tx.txId, 2);
    //Get the completed Transaction
    console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

  }

  /* Checking Wallet Balance */
  const getAlgoBalance = async (event) => {
    const algosdk = require('algosdk');
    const baseServer = 'https://testnet-algorand.api.purestake.io/idx2'
    const port = '';
    const token = {
      'X-API-Key': 'BjPgZDZX4T3ZjlUzyEl7H9ZYK5TtZbyq72ua1r63'
    };

    const indexerClient = new algosdk.Indexer(token, baseServer, port);

    let address = "FXAHTSPWE3LR4JDEE5RUCZF2LF44VBVXVFC3UUQGDZQEQVIZW4PHJ7QDXA";
    let response = await indexerClient.lookupAccountAssets(address).do();
    let algAmount;
    response.assets.forEach((asset) => {
      if (asset['asset-id'] === 90650110) {
        algAmount = asset['amount'] * 10 ** -8
        //console.log(algAmount)
      }
    })
    window.document.getElementById('algoWallet').innerHTML = "Algorand wETH Staging Pool:<br/>" + String(algAmount).substring(0, 8) + " wETH";

    if (loggedIn) {
      let response = await indexerClient.lookupAccountAssets(sessionStorage.getItem('address')).do();
      let wethAmount, stakedWethAmount, depWethAmount;
      response.assets.forEach((asset) => {
        if (asset['asset-id'] === 90650110) {
          wethAmount = asset['amount'] * 10 ** -8
          window.document.getElementById('wethAvail').innerHTML = "Your wETH balance:<br/>" + String(wethAmount).substring(0, 8) + " wETH";
        }
        if (asset['asset-id'] === 91208322) {
          //console.log(asset);
          stakedWethAmount = asset['amount'] * 10 ** -8
          window.document.getElementById('stWethBal').innerHTML = "Your Staked Ethereum (as stETH_LP):<br/>" + String(stakedWethAmount).substring(0, 8) + " stETH";
        }
        if (asset['asset-id'] === 91208285) {
          depWethAmount = asset['amount'] * 10 ** -8
          window.document.getElementById('depWeth').innerHTML = "Your Staged wETH:<br/>" + String(depWethAmount).substring(0, 8) + " wETH";
        }
      })
    }

    return algAmount;

  }
  getAlgoBalance();
  setInterval(getAlgoBalance, 1000);
  const getEthBalance = async (event) => {
    const Web3 = require('web3');
    const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/e8dcbee341124f3884d296c775de27fa"))

    let tokenAddress = "0x5a09E033863f74E80973491930d067Dc3B8797Cd";
    let walletAddress = "0xd40EefCFaB888C9159a61221def03bF77773FC19";

    let minABI = [{ "inputs": [{ "internalType": "address", "name": "_lidoContract", "type": "address" }, { "internalType": "address", "name": "_wethContract", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "checkStEthBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "checkWrappedETHBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "receiveEther", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "stake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "transferAndStakeWrappedEth", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "unwrap", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "wrap", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }];
    let contract = new web3.eth.Contract(minABI, tokenAddress);
    let balance = await contract.methods.checkStEthBalance().call();

    //console.log(web3.utils.fromWei(balance, "ether") + " ETH");
    //console.log(balance);
    window.document.getElementById('ethWallet').innerHTML = "Ethereum stETH Pool:<br/>" + web3.utils.fromWei(balance, "ether").substring(0, 8) + " stETH";

  }
  getEthBalance();
  setInterval(getEthBalance, 10000);


  /* Showing Logs */
  const displayLogs = async (event) => {
    let logs;
    await fetch('https://molten-muse-334822-default-rtdb.firebaseio.com/logs.json').then(function (response) {
      return response.json();
    }).then(function (data) {
      let url = 'https://demo.storj-ipfs.com/ipfs/' + data['Hash'];
      console.log(url);
      fetch(url).then(function (response) {
        return response.text();
      }).then(function (data) {
        console.log(data)
        logs = data;
        window.document.getElementById("transactionLogs").innerText = data;
      }).catch(function (err) {
        console.log("ipfs error", err);
      });
    }).catch(function () {
      console.log("error firebase Fuck");
    });

    window.document.getElementById("transactionLogs").innerText = logs;
    console.log(logs);
  }

  const graphing = async (event) => {
    const APIURL = 'https://api.thegraph.com/subgraphs/name/theothersteven/crossStaking'
    const tokensQuery = `
    {
      stEthPools(first: 10) {
        id
        cumStaked
        cumUnwrapped
        cumWithdrawal
        Transactions {
          id
          time
          staked
          withdrawal
        }
      }
    }  
    `
    const client = createClient({
      url: APIURL,
    })
    const cumulativeSum = (sum => value => sum += value)(0);

    const data = await client.query(tokensQuery).toPromise()
    window.document.getElementById("tvlLogs").innerText =
     data['data']['stEthPools']
       .map((elem) => {
         return elem['Transactions'].map((elem2) => parseInt(elem2['staked']));
       })
       .flat()
       .map(cumulativeSum)
       .reduce(
         (previousValue, currentValue) => previousValue + (currentValue / 1e18).toString() + " stETH \n", "TVL\n"
       )

  }


  /*****/

  return (
    <Container>
      <Container style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Header as="h1" content="crossStaking" textAlign="left" style={{ marginTop: '1em', marginBottom: '1em' }} />
        <Header as="p" id="account" content="Account: " style={{ marginTop: '2em', marginBottom: '2em' }} />
        <Button onClick={handleConnect} style={{ color: 'white', backgroundColor: 'steelblue', height: '50px', margin: 'auto 0' }}>
          Connect Wallet
        </Button>
      </Container>

      <Container>
        <Container style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Header as="p" id="algoWallet" content="Algorand wETH Staging Pool: " style={{ marginTop: '2em', marginBottom: '0.5em' }} />
          <Header as="p" id="ethWallet" content="Ethereum stETH Pool: " style={{ textAlign: 'right', marginTop: '2em', marginBottom: '0.5em' }} />
        </Container>


        <Container style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Header as="p" id="depWeth" content="Your Staged wETH: " style={{ marginTop: '0.5em', marginBottom: '0.5em' }} />
          <Header as="p" id="stWethBal" content="Your Staked Ethereum (as stETH_LP): " style={{ textAlign: 'right', marginTop: '0.5em', marginBottom: '0.5em' }} />

        </Container>

        <Container style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Header as="p" id="wethAvail" content="Your wETH balance: " style={{ textAlign: 'left', marginTop: '0.5em', marginBottom: '0.5em' }} />
        </Container>
      </Container>
      <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

<Input id="algoIn" label="ALGO" style={{ marginTop: '2em', marginBottom: '0.5em' }}></Input>
        <Button onClick={handleSendAlgo} style={{ color: 'white', backgroundColor: 'steelblue', height: '50px', margin: 'auto 0' }}>
          Convert ALGO to wETH
        </Button>
        <Input id="wethIn" label="wETH" style={{ marginTop: '0.5em' }}></Input>
        <Button onClick={handleSendWeth} style={{ marginTop: '10px', color: 'white', backgroundColor: 'steelblue', height: '50px' }}>
          Stake wETH
        </Button>
      </Container>

      <Container style={{ display: 'flex', flexDirection: 'column', marginTop: "20px" }}>

        <Button onClick={graphing} style={{ marginTop: '10px', color: 'white', backgroundColor: 'steelblue', height: '50px' }}>
          Get Staked TVL
        </Button>
        <Header as="p" id="tvlLogs" style={{ backgroundColor: "#efefef", borderRadius: "12px", padding: "20px", fontSize: "12px" }} />

      </Container>

      <Container style={{ display: 'flex', flexDirection: 'column', marginTop: "20px" }}>

        <Button onClick={displayLogs} style={{ marginTop: '10px', color: 'white', backgroundColor: 'steelblue', height: '50px' }}>
          Show Recent Transactions
        </Button>
        <Header as="p" id="transactionLogs" style={{ backgroundColor: "#efefef", borderRadius: "12px", padding: "20px", fontSize: "12px" }}>

        </Header>

      </Container>

    </Container>
  );
}

export default App;
