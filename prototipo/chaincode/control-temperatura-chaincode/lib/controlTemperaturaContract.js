/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class controlTemperaturaContract extends Contract {

    async initLedger(ctx) {

    }

    async temperatureRecord(ctx, id, temp) {

        let temperature = {
            date: Date.now(),
            temperature: temp
        }
        if(temp >= 30){
            temperature.state = 'Alert'
        }else{
            temperature.state = 'Ok'
        }

            await ctx.stub.putState(id, Buffer.from(JSON.stringify(temperature)));
       

        return temperature;

    }


}

module.exports = controlTemperaturaContract;