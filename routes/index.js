var express = require("express");
var Web3 = require("web3");
var router = express.Router();
var transfer_sol = require("../src/transfer/solana");
require("dotenv").config();

var _from=0, _to=1;
var Bridge_Address = {
  "BSC_TEST" : {
    "SOL_DEV" : ["0x2D94172436D869c1e3c094BeaD272508faB0d9E3","0x92eFc3407dF604F78be02b8a1133CEC421e9680E"] // token address , bridge address
  }
}
var DB = {
  recipes: [
    {
      "chain": ["BSC_TEST", "SOL_DEV"],
      "address": ["0x3c2465d88C6546eac6F9aa6f79081Ad874CA2E8b", "6TnhBCdLSET7smE2eFFRb7t58tx4WkgZZhrRkxwgerBP"],
  }
  ],
  spent: {}
};



/* GET home page. */
router.post("/create", function (req, res, next) {
  const {chain, address} = req.body;

  if(chain[_from]!="BSC_TEST" || chain[_to] != "SOL_DEV" ) {
    res.send("wrong network");
    return;
  }

  const id = DB.recipes.length;
  DB.recipes.push(req.body);

  console.log(JSON.stringify(DB));

  // res.render("index", { title: "Express" });
  res.send(JSON.stringify({id:id}));
});
/* GET home page. */
router.post("/submission", async function (req, res, next) {
  const {id, txid} = req.body;
  if (!DB.recipes[id]) {
    res.send("Id incorrect");
    return;
  }
  const {chain, address, spent} = DB.recipes[id];
  
  if (DB.spent[txid]) { // Is RCG Token 
    res.send("Is already spent");
    return;
  } else DB.spent[txid]=true;
  
  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_BSC_TEST));
  const tx_info = await web3.eth.getTransaction(txid);
  const {toChecksumAddress, hexToNumberString, fromWei, toWei} = web3.utils;

  const toAmount = (raw) => {
    const hex_raw = hexToNumberString("0x"+raw);
    return fromWei(hex_raw,"ether");
  }

  const {input, to} = tx_info;

  const to_addr = toChecksumAddress("0x"+input.substr(34,40));
  const raw_amount = input.substr(74,64);
  const amount = toAmount(raw_amount);
  if (to != Bridge_Address[chain[_from]][chain[_to]][0]) { // Is RCG Token 
    res.send("Not RCG Token");
    return;
  }
  if (input.substr(0,10) != "0xa9059cbb" ){ // Is transfer transaction
    res.send("Not transfer TX");
    return;
  }
  if (to_addr != Bridge_Address[chain[_from]][chain[_to]][1]) { // Is to address equle bridge address
    res.send("Not to bridge address");
    return;
  }

  var Sol_amount = amount;
  const split = Sol_amount.split('.');
  if(split[1].length>9) {
    Sol_amount = split[0] +"."+ split[1].substr(0,9);
  } 
  Sol_amount = toWei(Sol_amount,"gwei");
  

  // res.send(Sol_amount)
  const ret_txid = await transfer_sol(address[_to], Sol_amount);
  res.send({id:ret_txid});

});

module.exports = router;
