// geth --http --http.corsdomain http://remix.ethereum.org --allow-insecure-unlock --http --http.port 8545 --http.addr 127.0.0.1 --http.corsdomain "*" --http.api "eth,net,web3,personal,miner" --datadir node1 --nodiscover --networkid 4321 --port 30303 console


const ipfsClient = require('ipfs-http-client');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const mysql = require("./storehash").con
const path = require("path");
// const port= 3004;
var urlencodedParser = require('urlencoded-parser');
var alert = require('alert');
const e = require('express');
const res = require('express/lib/response');
const { urlencoded } = require('body-parser');

const ipfs = new ipfsClient({ host: 'localhost', port: '5001', protocol: 'http'});
const app = express();

app.use(express.urlencoded({extended:false}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());
// app.use(express.static(__dirname + "login.html"));
// app.use(express.static(__dirname + "home.html"));
// app.use(express.static(__dirname + "upload.html"));
app.use(express.static("public"));
//**updation**
const authRoutes = require('./routes/auth-routes');
const { on } = require('events');
const { con } = require('./storehash');
//****deployer.js****
// solc compiler

// file reader

// Creation of Web3 class
Web3 = require("web3");
// Setting up a HttpProvider
web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
solc = require("solc");
// Reading the file
let file=fs.readFileSync("D:/BC verify/BC verify/storehash.js").toString()

// console.log(file);

// input structure for solidity compiler
var input = {
	language: "Solidity",
	sources: {
		"storehash.sol": {
			content: file,
		},
	},

	settings: {
		outputSelection: {
			"*": {
				"*": ["*"],
			},
		},
	},
};
//personal.unlockAccount(eth.accounts[0])
//geth --http --http.corsdomain http://remix.ethereum.org --allow-insecure-unlock --http --http.port 8545 --http.addr 127.0.0.1 --http.corsdomain "*" --http.api "eth,net,web3,personal,miner" --datadir node1 --nodiscover --networkid 4321 --port 30303 console
var  output = JSON.parse(solc.compile(JSON.stringify(input)));
 console.log("Result : ", output);

ABI=output.contracts['storehash.sol']['storehash'].abi
bytecode=output.contracts["storehash.sol"]["storehash"].evm.bytecode.object
// console.log("Bytecode: ", bytecode);
// console.log("ABI: ", ABI);
var contract = new web3.eth.Contract(ABI);

// app.set('view engine', 'hbs');
app.set('view engine', 'ejs');

//**Updation**
//set up routes
app.use('/auth',authRoutes);
//


app.get('/',(req,res) => {
    res.render('page');
});
app.get('/login',(req,res) => {
    res.render('login');
});
app.get('/view_products',(req,res) => {
    res.render('view_products');
});
app.get('/register',(req,res) => {
    res.render('register');
});
app.get('/home',(req,res) => {
    res.render('home');
});
app.get('/home_user',(req,res) => {
    res.render('home_user');
});

app.get('/verify',(req,res) => {
    res.render('verify');
});

app.get('/verified',(req,res) => {
    res.render('verified');
});

app.get('/directupload',(req,res) => {
    res.render('home');
});

app.post('/verifydocument',function(req, res){
    var fileid = req.body.fileid; 
    const file = req.files.file;
    const fileName = req.body.fileName;
    const filePath = 'files/' + fileName;


        let sql2 = "select fhash from hash where (fileid)=?";
        var values = [
            [fileid]
        ];
        con.query(sql2,[values],function(error,result){
            if(error) console.log(error);

            if(result.length>0)
            {
                

                file.mv(filePath, async (err) => {
                    if(err){
                        console.log('Error: failed to download file');
                        return res.status(500).send(err);
                    }
            
                    const fileHash = await addFile2(fileName, filePath);
                    fs.unlink(filePath, (err) => {
                        if (err) console.log(err);
                    });
                    
                    if(fileHash==result[0].fhash)
                    {
                        var yes = "Verified, Document is not tampered.";
                        res.render('verified', {yes});
                    }
                    else
                    {
                        var yes = "Verified, Document is tampered!!";
                        res.render('verified', {yes});
                    }
                });
            }
        });

});

const addFile2 = async ( fileName,filePath) => {
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({path: fileName, content: file});
    const fileHash = fileAdded[0].hash;

    return fileHash;
}

app.post('/add_products', function(req, res){

    var pid = req.body.pid;
    var name = req.body.name; 
    var price = req.body.price;
    var stock = req.body.stock;
    var sql = "insert into products(pid,name,price,stock) values ?";
    var values = [
        [pid,name,price,stock]
    ];
    con.query(sql,[values],function(error,result){
        if(error) console.log(error);

         var sql = "select * from products";
   
        con.query(sql,function(error,result){
        if(error) console.log(error);
            res.render("view_products",{userdata:result});
            });
    });



});

app.post('/upload',(req,res) =>{
    const fileid = req.body.fileid;
    const file = req.files.file;
    const fileName = req.body.fileName;
    const filePath = 'files/' + fileName;

    file.mv(filePath, async (err) => {
        if(err){
            console.log('Error: failed to download file');
            return res.status(500).send(err);
        }

        const fileHash = await addFile(fileid, fileName, filePath);
        fs.unlink(filePath, (err) => {
            if (err) console.log(err);
        });

        res.render('upload', {fileName,fileHash});
    });
});




const addFile = async (fileid, fileName,filePath) => {
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({path: fileName, content: file});
    const fileHash = fileAdded[0].hash;
    
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
                Contract.methods.get().call({ from: '0x9d19CD6d26C4Cf85f0c9f76eDcbc43C10f5BB1F3' }).then((fhash) => {
                    console.log("Result:", fhash);
                    const insertQuery = "insert into hash(fileid,fhash) values (?,?)";
                    con.query(insertQuery, [fileid,fhash], function(error, results){
                        if (error) {
                            console.error(error);
                        } else {
                            console.log(`Inserted hash ${fhash} with fileid ${fileid} into database`);
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
}


   

    //return fileHash;

app.listen(12000, () => {
    console.log('server is listening on port 12000');
})

