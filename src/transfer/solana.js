const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
require("dotenv").config();

module.exports = async (tokenId, toPubkey, amount) => {
  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl(process.env.SOL_NETWORK),
    "confirmed"
  );

  //5GuFNcxFvw5vTSyuHBF5WTAGYNui426KHA5iqdRx3mxu
  const SECRET_KEY = new Uint8Array(
    JSON.parse(`[${process.env.SOL_SECRET_KEY}]`)
  );

  // Generate a new wallet keypair and airdrop SOL
  var fromWallet = web3.Keypair.fromSecretKey(SECRET_KEY);

  // Generate a new wallet to receive newly token
  const toWallet = new web3.PublicKey(toPubkey);

  // Create new token mint
  const token = new splToken.Token(
    connection,
    new web3.PublicKey(tokenId),
    splToken.TOKEN_PROGRAM_ID,
    fromWallet
  );

  // Get the token account of the fromWallet Solana address, if it does not exist, create it
  const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
  );

  //get the token account of the toWallet Solana address, if it does not exist, create it
  const toTokenAccount = await token.getOrCreateAssociatedAccountInfo(toWallet);

  // await mint.mintTo(fromTokenAccount.address, fromWallet.publicKey, [], amount);
  // Add token transfer instructions to transaction
  const transaction = new web3.Transaction().add(
    splToken.Token.createMintToInstruction(
      splToken.TOKEN_PROGRAM_ID,
      new web3.PublicKey(tokenId),
      toTokenAccount.address,
      fromWallet.publicKey,
      [],
      amount
    )
  );

  // Sign transaction, broadcast, and confirm
  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [fromWallet],
    { commitment: "confirmed" }
  );

  console.log("SIGNATURE", signature);
  return signature;
};
