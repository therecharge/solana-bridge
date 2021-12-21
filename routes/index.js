var express = require("express");
var Web3 = require("web3");
var router = express.Router();
var transfer_sol = require("../src/withdraw/solana");
require("dotenv").config();

var _from = 0,
  _to = 1;
var Bridge_Info = {
  BSC_TEST: {
    SOL_DEV: {
      from_token: "0x2D94172436D869c1e3c094BeaD272508faB0d9E3", // token contract
      bridge_address: "0x92eFc3407dF604F78be02b8a1133CEC421e9680E", // bridge address
      to_token: "7MSNCihCuVurNDNuVFEYpvod5PaBp3XTjA3obtb8168f", //solana token id
      to_network: "devnet",
    },
  },
  BSC: {
    SOL: {
      from_token: "0x2D94172436D869c1e3c094BeaD272508faB0d9E3", // token contract
      bridge_address: "0x92eFc3407dF604F78be02b8a1133CEC421e9680E", // bridge address
      to_token: "3TM1bok2dpqR674ubX5FDQZtkyycnx1GegRcd13pQgko", //solana token id
      to_network: "mainnet-beta",
    },
    SOL_DEV: {
      from_token: "0x2D94172436D869c1e3c094BeaD272508faB0d9E3", // token contract
      bridge_address: "0x92eFc3407dF604F78be02b8a1133CEC421e9680E", // bridge address
      to_token: "7MSNCihCuVurNDNuVFEYpvod5PaBp3XTjA3obtb8168f", //solana token id
      to_network: "devnet",
    },
  },
  ETH: {
    SOL: {
      from_token: "0xe74bE071f3b62f6A4aC23cA68E5E2A39797A3c30", // token contract
      bridge_address: "0x92eFc3407dF604F78be02b8a1133CEC421e9680E", // bridge address
      to_token: "3TM1bok2dpqR674ubX5FDQZtkyycnx1GegRcd13pQgko", //solana token id
      to_network: "mainnet-beta",
    },
  },
};
var DB = {
  recipes: [],
  spent: {},
};


router.post("/create", function (req, res, next) {
  const { chain, address } = req.body;
  const { from_token, to_token, bridge_address, to_network } =
    Bridge_Info[chain[_from]][chain[_to]];

  if (!from_token) {
    res.send("wrong network");
    return;
  }

  const id = DB.recipes.length;
  DB.recipes.push(req.body);

  console.log("/create", id);
  console.table(req.body);

  res.send(
    JSON.stringify({
      id: id,
      bridge: bridge_address,
    })
  );
});


router.post("/submission", async function (req, res, next) {
  const { id, txid } = req.body;
  if (!DB.recipes[id]) {
    res.send("Id incorrect");
    return;
  }
  const { chain, address, spent } = DB.recipes[id];

  if (DB.spent[txid]) {
    // Is RCG Token
    res.send("Is already spent");
    return;
  } else DB.spent[txid] = true;

  const web3 = new Web3(
    new Web3.providers.HttpProvider(process.env[`RPC_${chain[_from]}`])
  );
  const tx_info = await web3.eth.getTransaction(txid);
  console.table(tx_info);
  const { toChecksumAddress, hexToNumberString, fromWei, toWei } = web3.utils;

  const toAmount = (raw) => {
    const hex_raw = hexToNumberString("0x" + raw);
    return fromWei(hex_raw, "ether");
  };

  const { input, to } = tx_info;
  const { from_token, to_token, bridge_address, to_network } =
    Bridge_Info[chain[_from]][chain[_to]];

  const to_addr = toChecksumAddress("0x" + input.substr(34, 40));
  const raw_amount = input.substr(74, 64);
  const amount = toAmount(raw_amount);
  if (to != from_token) {
    // Is RCG Token
    res.send("Not RCG Token");
    return;
  }
  if (input.substr(0, 10) != "0xa9059cbb") {
    // Is transfer transaction
    res.send("Not transfer TX");
    return;
  }
  if (to_addr != bridge_address) {
    // Is to address equle bridge address
    res.send("Not to bridge address");
    return;
  }

  var Sol_amount = amount;
  const split = Sol_amount.split(".");
  if (split[1].length > 9) {
    Sol_amount = split[0] + "." + split[1].substr(0, 9);
  }
  Sol_amount = toWei(Sol_amount, "gwei");

  // res.send(Sol_amount)
  const ret_txid = await transfer_sol(
    to_token,
    address[_to],
    Sol_amount,
    to_network
  );
  res.send({ id: ret_txid });
});

module.exports = router;
