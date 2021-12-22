var Web3 = require("web3");
const Bridge_Info = require("../../lib/Bridge_Info.json");
require("dotenv").config();

const _from = 0,
  _to = 1;
module.exports = async (tokenId, toPubkey, amount, _, network = "BSC_TEST") => {
  const web3 = new Web3(
    new Web3.providers.HttpProvider(process.env[`RPC_${network}`])
  );
  console.log("privateKey", process.env[`${network}_SECRET_KEY`]);
  const account = web3.eth.accounts.privateKeyToAccount(
    "0x" + process.env[`${network}_SECRET_KEY`]
  );
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  console.log(account.address);

  return txid;
};
