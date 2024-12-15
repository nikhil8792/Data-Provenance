// geth --http --http.corsdomain http://remix.ethereum.org --allow-insecure-unlock --http --http.port 8545 --http.addr 127.0.0.1 --http.corsdomain "*" --http.api "eth,net,web3,personal,miner" --datadir node1 --nodiscover --networkid 4321 --port 30303 console
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const e = require('express');
const res = require('express/lib/response');
const fs = require('fs')
const { con } = require('./storehash');
const app = express();

app.use(express.urlencoded({extended:false}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Creation of Web3 class
Web3 = require("web3");
// Setting up a HttpProvider
web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
solc = require("solc");
// Reading the file
let file=fs.readFileSync("D:/5th sem/ipfs_upload_database - admin/storehash.sol").toString()

// console.log(file);

// input structure for solidity compiler
var input = {
    language: "Solidity",    sources: {
        "storehash.sol": {            content: file,
        },    },
    settings: {
        outputSelection: { "*": {
                "*": ["*"],},
        },    },
};
var  output = JSON.parse(solc.compile(JSON.stringify(input))); console.log("Result : ", output);
ABI=output.contracts['storehash.sol']['storehash'].abi
bytecode=output.contracts["storehash.sol"]["storehash"].evm.bytecode.object
var contract = new web3.eth.Contract(ABI);
 
    web3.eth.getAccounts().then((accounts) => {
        // Display all Geth Accounts
        console.log("Accounts:", accounts);
        mainAccount = accounts[0]; // address that will deploy smart contract
        console.log("Default Account:", mainAccount);
        contract.deploy({ data: bytecode }).send({ from: mainAccount }).on("receipt", (receipt) => {
            // Contract Address will be returned here
            console.log("Contract Address:", receipt.contractAddress);
            Contract = new web3.eth.Contract(ABI, receipt.contractAddress);
            Contract.methods.set_test(fileHash).send({ from: "0x9d19CD6d26C4Cf85f0c9f76eDcbc43C10f5BB1F3" }).then(() => {
                Contract.methods.get().call({ from: '0x9d19CD6d26C4Cf85f0c9f76eDcbc43C10f5BB1F3' }).then((hash) => {
                    console.log("Result:", hash);
                    const insertQuery = "insert into hash(hash) values (?)";
                    con.query(insertQuery, [hash], function(error, results){
                        if (error) {
                            console.error(error);
                        } else {
                            console.log(`Inserted hash ${hash} into database`);
                        }
                    });
                }).catch((error) => {
                    console.log("Error:", error);
                });
            }).catch((error) => {
                console.log("Error:", error);
            });
        }).catch((error) => {
            console.log("Error:", error);
        });
    });
    return fileHash;
    