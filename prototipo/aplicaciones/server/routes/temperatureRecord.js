
////////////////////////////////////////////////////////////////////
////////////////////////// IMPORTS /////////////////////////////////
////////////////////////////////////////////////////////////////////

require('../config/config');
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve('../', '../', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const express = require('express');
const app = express();



app.post('/temperatureRecord', async (req, res) => {

    // body => { id, temp}
    let body = req.body

    //Parameters validation
    if ((!body.id) ||( !body.temp) ) {
        console.error(`Failed to send transaction: Missing arguments\n`);
        return res.status(400).json({
            ok: false,
            response: {
                msg: 'Missing arguments in request body'
            }
        });
    }


    try {

        //Create a new file system based wallet for managing identities.
        const wallet = new FileSystemWallet(process.env.WALLETPATH);

        //Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity:'admin', discovery: { enabled: false } });

        //Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('prototipochannel');

        //Get the contract from the network.
        const contract = network.getContract('control-temperatura-chaincode', 'controlTemperaturaContract');

        //Send transaction to the smart contract
        let responseTx = (await contract.submitTransaction('temperatureRecord', body.id,body.temp)).toString();


        console.log('Transaction has been submitted with result: ' + JSON.stringify(responseTx) +'\n');

        let response = {
            ok: true,
            response:{
                msg: `Temperature Record succesfully`,
                data: responseTx
            }
        }

        network.addBlockListener('my-block-listener', await ((err, block) => {
            if (err) {
                console.error(err);
                return;
            }

            let blockInfo ={
                blockNumber : block.header.number,
                data_hash : block.header.data_hash,
                //previous_hash : block.header.previous_hash,
                tx_id: block.data.data[0].payload.header.channel_header.tx_id
            }

            response.response.blockInfo = blockInfo
        }));



        //Disconnect from the gateway.
        await gateway.disconnect();

        //Delete user-temp
       // wallet.delete(body.identity.userContent.name);

        setTimeout(()=>{
            res.status(201).json(response)
        },200)


    } catch (error) {
        //if(wallet.exist(identity.userContent.name)) wallet.delete(identity.userContent.name);
        console.error(`Failed to submit transaction: ${error}\n`);
        return res.status(500).json({
            ok:false,
            response:{
                msg: `Failed to submit create product transaction\nERROR: ${error}`
            }
        });
    }

});

module.exports = app;