const { Connection, clusterApiUrl } = require("@solana/web3.js");

const main = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'processed');

    const {current, delinquent} = await connection.getVoteAccounts();

    console.log("Validator stats for devnet");
    console.log('First validator who is currently participating is ');
    console.log(current[0]);

    console.log("Total Validators ", current.concat(delinquent).length);
    console.log("Total current validators", current.length)
};

const runMain = async () => {
    try {
        await main();
    } catch(error) {
        console.error(error);
    }
};

runMain();