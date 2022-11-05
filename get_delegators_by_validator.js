// For a Validator represented by VOTE_PUB_KEY variable below, obtain
// the total number of delegators who staked their SOL to this validator

// Also print the information about one such delegator

// The validator VALIDATOR_VOTE_PUB_KEY was obtained from running the program delegate_stake.js

// The vlaidator vote_pub_key may need to be updated everytime this 
// code is run


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

    const STAKE_PROGRAM_ID = new PublicKey("Stake11111111111111111111111111111111111111");
    const VALIDATOR_VOTE_PUB_KEY = "F95vVhuyAjAtmXbg2EnNVWKkD5yQsDS5S83Uw1TUDcZm";

    // using filters search all the accounts to match the account which has the 
    // pubey matching the validator we are looking for
    const accounts = await connection.getParsedProgramAccounts(
        STAKE_PROGRAM_ID,
        {
            filters: [
                {dataSize: 200},
                {
                    memcmp: {
                        offset: 124,
                        bytes: VALIDATOR_VOTE_PUB_KEY,
                    },
                },
            ],
        }
    );


    console.log(accounts[0]);

    console.log(`Total number of delegators for 
        validator ${VALIDATOR_VOTE_PUB_KEY} is ${accounts.length}`);
    
    if (accounts.length) {
        console.log(`The first delegator to the 
        validator is: ${JSON.stringify(accounts[0])}`);
    }

};


const runMain = async () => {
    try {
        await main();
    } catch(error) {
        console.error(error);
    }
};

runMain();