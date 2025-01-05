import { connected, dataPacket, isTestnet, claimableBalances, notifications, accountInfo, lastUpdate, type DataPacket } from '$lib/wallet-store';

import { callMetaStellar } from '$lib/callMetaStellar';
import * as StellarSdk from '@stellar/stellar-sdk';
import { network } from '../../store';

let $_connected = false;
connected.subscribe((value)=>$_connected = value);

let $_isTestnet = false;
isTestnet.subscribe((value)=>$_isTestnet = value);

let $_dataPacket:DataPacket|null = null;
dataPacket.subscribe((value)=>$_dataPacket = value);

let $_lastUpdate = 0;
lastUpdate.subscribe((value)=>$_lastUpdate = value);

let $_claimableBalances:any[] = [];
claimableBalances.subscribe((value)=>$_claimableBalances = value);

let $_accountInfo:any = null;
accountInfo.subscribe((value)=>$_accountInfo = value);

let $_notifications:any[] = [];
notifications.subscribe((value)=>$_notifications = value);

export async function updateAccountInfo(){
    console.log("updateInfoCalled");

    console.log("connected: "+$_connected);
    console.log("isTestnet: "+$_isTestnet);
    console.log("lastUpdate: "+$_lastUpdate);
    console.log("dataPacket: "+$_dataPacket);
    console.log("claimableBalances: "+$_claimableBalances);
    console.log("accountInfo: "+$_accountInfo);
    console.log("notifications: "+$_notifications);


    if($_connected){
        let url = $_isTestnet?'https://horizon-testnet.stellar.org':'https://horizon.stellar.org';
        if($_connected){
            
            console.log("updating wallet data");
            $_dataPacket = await callMetaStellar('getDataPacket', {testnet:($_isTestnet)});
            let server = new StellarSdk.Horizon.Server(url);
            let account = await server.loadAccount($_dataPacket.currentAddress);
            console.log(account);
            claimableBalances.set(await server.claimableBalances().claimant($_dataPacket.currentAddress).call());
            console.log($_claimableBalances);
            let temp_notifications = [];
            for(let i = 0; i<$_claimableBalances.records.length; i++){
                let notificationObject = {
                    type:'claimableBalance',
                    isTestnet:$_isTestnet,
                    data:$_claimableBalances.records[i]
                }
                temp_notifications.push(notificationObject);
            }
            notifications.set(temp_notifications);
            
            accountInfo.set(account);
            
            //2 base reserves + numSubEntries + numSponsoring - numSponsored) * baseReserve + liabilities.selling
            
            
        }
        lastUpdate.set(new Date().getTime());
        
    }
    
}
