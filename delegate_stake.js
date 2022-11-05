const { 
    Connection, 
    clusterApiUrl, 
    Keypair, 
    LAMPORTS_PER_SOL, 
    StakeProgram,
    Authorized,
    Lockup,
    sendAndConfirmTransaction,
    PublicKey
} = require("@solana/web3.js");

const main = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'processed');

    const wallet = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(
        wallet.publicKey,
        2 * LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(airdropSignature);
    const walletBalance = await connection.getBalance(wallet.publicKey);
    console.log("Wallet balance in SOL after airdrop is ", walletBalance / LAMPORTS_PER_SOL);
    
    // generate a keypair which will be used as the staking account
    const stakeAccount = Keypair.generate();
    const rentStakeAccount = await connection
        .getMinimumBalanceForRentExemption(StakeProgram.space);
    const totalStakeAmount = rentStakeAccount + 0.5*LAMPORTS_PER_SOL;

    const createStakeAccountTx = StakeProgram.createAccount({
        authorized: new Authorized(wallet.publicKey, wallet.publicKey),
        fromPubkey: wallet.publicKey,
        lamports: totalStakeAmount,
        lockup: new Lockup(0, 0, wallet.publicKey),
        stakePubkey: stakeAccount.publicKey
    });

    const createStakeAccountTxID = await sendAndConfirmTransaction(
        connection, createStakeAccountTx, [wallet, stakeAccount]
    );

    console.log("Transaction ID of stake account creation is ", createStakeAccountTxID);
    
    let stakeBalance = await connection.getBalance(stakeAccount.publicKey);
    console.log("Balance at the stake account is ", stakeBalance/LAMPORTS_PER_SOL);

    // stake account has balance but has not been activated to stake balance yet
    let stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
    console.log("Stake account status: ", stakeStatus.state);

    // stake to a validator
    const validators = await connection.getVoteAccounts();
    const selectedValidator = validators.current[0];
    const selectedValidatorPubKey = new PublicKey(selectedValidator.votePubkey);

    const delegateStakeTx = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: wallet.publicKey,
        votePubkey: selectedValidatorPubKey
    });

    const delegateTxId = await sendAndConfirmTransaction(
        connection,
        delegateStakeTx,
        [wallet]
    );

    console.log("Stake delegated to validator: ", selectedValidatorPubKey.toString());
    console.log("Delegate stake transaction id ", delegateTxId);

    stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
    console.log("Stake account status is ", stakeStatus.state);

};

const runMain = async () => {
    try {
        await main();
    } catch(error) {
        console.error(error);
    }
};

runMain();