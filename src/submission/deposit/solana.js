const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const Bridge_Info = require("../../lib/Bridge_Info.json");
require("dotenv").config();

const _from = 0,
  _to = 1;

module.exports = async (chain, txid) => {
  const { from_token, to_token, bridge_address, sol_network } =
    Bridge_Info[chain[_from]][chain[_to]];
  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl(sol_network),
    "confirmed"
  );

  const tx_info = await connection.getTransaction(txid);

  // console.log(JSON.stringify(tx_info));
  const pre = tx_info.meta.preTokenBalances;
  const post = tx_info.meta.postTokenBalances;

  const from_addr = pre[_from].owner;
  const to_addr = post[_to].owner;
  const amount =
    pre[_from].uiTokenAmount.amount - post[_from].uiTokenAmount.amount;
  //   console.log(
  //     "pre[_from].uiTokenAmount.amount",
  //     pre[_from].uiTokenAmount.amount
  //   );
  // console.log("pre[_to].uiTokenAmount.amount");
  if (to_addr != bridge_address) {
    // Is to address equle bridge address
    res.send("Not to bridge address");
    return;
  }
  if (from_token != pre[_from].mint) {
    // Is from token is not RCG Token
    res.send("Not RCG Token");
    return;
  }

  console.log("pre", { from_addr, to_addr, amount });
  return { sol_network, bridge_address, to_token, Sol_amount: amount };
  // console.log("post", tx_info.meta.postTokenBalances);
};
