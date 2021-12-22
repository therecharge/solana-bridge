var Web3 = require("web3");
const Bridge_Info = require("../../lib/Bridge_Info.json");
const RCG_Token = require("../../../artifacts/RCGToken.json");
require("dotenv").config();

const _from = 0,
  _to = 1;
module.exports = async (tokenId, toPubkey, amount, _, chain) => {
  console.log("withdraw/ethereum");
  const web3 = new Web3(
    new Web3.providers.HttpProvider(process.env[`RPC_${chain[_to]}`])
  );
  const { fromWei } = web3.utils;
  const account = web3.eth.accounts.privateKeyToAccount(
    "0x" + process.env[`${chain[_to]}_SECRET_KEY`]
  );
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  const TOKEN = new web3.eth.Contract(
    RCG_Token.abi,
    Bridge_Info[chain[_from]][chain[_to]].to_token
  );
  // a = await TOKEN.methods.totalSupply().call();
  // console.log("SFSAFASDFAS", a);
  // const tx = await TOKEN.methods
  amount = String(amount + "000000000" - process.env[`${chain[_to]}_FEE`]);
  const gasPrice = await web3.eth.getGasPrice();
  const gasEstimate = await TOKEN.methods
    .transfer(toPubkey, amount)
    .estimateGas({ from: account.address });

  // console.log({ toPubkey, amount });
  const tx = await TOKEN.methods
    .transfer(toPubkey, amount)
    .send({ from: account.address, gasPrice: gasPrice, gas: gasEstimate });
  return tx.transactionHash;
};
