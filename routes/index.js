const express = require("express");
const router = express.Router();
const deposit_sol = require("../src/submission/deposit/solana");
const deposit_ethereum = require("../src/submission/deposit/ethereum");
const transfer_sol = require("../src/submission/withdraw/solana");
const transfer_ethereum = require("../src/submission/withdraw/ethereum");
const create = require("../src/create");
const db = require("../src/lib/db");
require("dotenv").config();

const deposit = {
  SOL: deposit_sol,
  ETH: deposit_ethereum,
  BSC: deposit_ethereum,
};
const withdraw = {
  SOL: transfer_sol,
  ETH: transfer_ethereum,
  BSC: transfer_ethereum,
  BSC_TEST: transfer_ethereum,
};

const _from = 0,
  _to = 1;
var DB = {
  recipes: [],
  spent: {},
};

router.post("/create", create(DB));

router.post("/submission", async (req, res, next) => {
  const { id, txid } = req.body;
  // console.log("asdf", DB);
  if (!DB.recipes[id]) {
    res.send("Id incorrect");
    return;
  }
  const { chain, address } = DB.recipes[id];

  if (DB.spent[txid]) {
    // Is RCG Token
    res.send("Is already spent");
    return;
  } else DB.spent[txid] = true;

  const { sol_network, bridge_address, to_token, Sol_amount } = await deposit[
    chain[_from]
  ](chain, txid, res);

  // console.log("withdraw[chain[_to]]", withdraw[chain[_to]]);
  // console.log({ sol_network, bridge_address, to_token, Sol_amount });
  const ret_txid = await withdraw[chain[_to]](
    to_token,
    address[_to],
    Sol_amount,
    sol_network,
    chain
  );
  res.send({ id: ret_txid });
});

module.exports = router;
