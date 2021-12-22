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

router.post("/create", create());

router.post("/submission", async (req, res, next) => {
  try {
    const { id, txid } = req.body;
    const recipe = await db.getRecipe(id);
    console.log("recipe", recipe);
    if (!recipe) {
      res.send("Id incorrect");
      return;
    }
    const { chain_from, chain_to, address_from, address_to } = recipe;

    const transaction = await db.getTransaction(txid);
    console.log(transaction);
    if (transaction != undefined) {
      // Is RCG Token
      res.send("Is already spent");
      return;
    } else
      db.createTransaction([
        txid,
        JSON.stringify({
          id,
          chain_from,
          chain_to,
          address_from,
          address_to,
        }),
      ]);

    const { sol_network, bridge_address, to_token, Sol_amount } = await deposit[
      chain_from
    ]([chain_from, chain_to], txid, res);

    // console.log("withdraw[chain[_to]]", withdraw[chain[_to]]);
    // console.log({ sol_network, bridge_address, to_token, Sol_amount });
    const ret_txid = await withdraw[chain_to](
      to_token,
      address_to,
      Sol_amount,
      sol_network,
      [chain_from, chain_to]
    );
    res.send({ id: ret_txid });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
