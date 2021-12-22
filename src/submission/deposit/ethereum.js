var Web3 = require("web3");
const Bridge_Info = require("../../lib/Bridge_Info.json");
require("dotenv").config();

const _from = 0,
  _to = 1;
module.exports = async (chain, txid, res) => {
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
  const { from_token, to_token, bridge_address, sol_network } =
    Bridge_Info[chain[_from]][chain[_to]];

  const to_addr = toChecksumAddress("0x" + input.substr(34, 40));
  const raw_amount = input.substr(74, 64);
  const amount = toAmount(raw_amount);
  if (to != from_token) {
    // Is RCG Token
    console.log("to", to);
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
  return { sol_network, bridge_address, to_token, Sol_amount };
};
