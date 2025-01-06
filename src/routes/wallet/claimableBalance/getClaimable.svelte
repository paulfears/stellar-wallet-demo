<script lang='ts'>
import {updateAccountInfo} from '../updateData';
import { Button, P } from 'flowbite-svelte';
//https://horizon-testnet.stellar.org/claimable_balances?claimant=GBUILN7TAGOJ4OPTJMYGTVAOKIBAMSW4KYKNZPKQWQBVKBRVVDOREVEW
import { callMetaStellar } from '$lib/callMetaStellar';
import { dataPacket, isTestnet} from '$lib/wallet-store';
import {Decimal} from 'decimal.js';

import * as StellarSDK from '@stellar/stellar-sdk';
export let claimableBalance;

let id = claimableBalance.id;
let code = claimableBalance.asset.split(':')[0];
let issuer = claimableBalance.asset.split(':')[1];
let amount = claimableBalance.amount;
let sender = claimableBalance.sponsor;
let clawbackEnabled = claimableBalance.flags.clawback_enabled;

let asset = new StellarSDK.Asset(code, issuer);

let loading = false;

async function claim(){
    loading = true;
    let claimBalance = StellarSDK.Operation.claimClaimableBalance({
        balanceId: id,
    });

    let url = $isTestnet?'https://horizon-testnet.stellar.org':'https://horizon.stellar.org';

    let server = new StellarSDK.Horizon.Server(url);
    let account = await server.loadAccount($dataPacket.currentAddress);
    let tx = new StellarSDK.TransactionBuilder(account, { fee: StellarSDK.BASE_FEE })
    console.log("checking trustlines");
    let trustLimit = new Decimal(0);
    let trustNeeded = new Decimal(amount);
    let trustGood = false;
    for(let i = 0; i<account.balances.length; i++){
        let assetInfo = account.balances[i]
        let balance = new Decimal(assetInfo.balance);
        if(assetInfo.asset_code === code && assetInfo.asset_issuer === issuer){
            trustLimit = new Decimal(assetInfo.limit);
            let remaining = trustLimit.sub(balance);
            if(remaining.greaterThanOrEqualTo(amount)){
                console.log("trustline found");
                trustGood = true;
                break;
            }
            else{
                console.log("trustline found but not enough limit");
                trustGood = false;
                trustNeeded = trustNeeded.sub(remaining);
                break;
            }
            
        }
    }
    if(!trustGood){
        console.log("trustline not found");
        let changeTrust = StellarSDK.Operation.changeTrust({
            asset: asset,
            limit: trustLimit.add(trustNeeded).toString()
        });
        tx.addOperation(changeTrust);
    }

    
    const xdr =tx.addOperation(claimBalance)
    .setNetworkPassphrase( $isTestnet?StellarSDK.Networks.TESTNET:StellarSDK.Networks.PUBLIC)
    .setTimeout(180)
    .build()
    .toXDR();

    let response = await callMetaStellar('signAndSubmitTransaction', {transaction:xdr, testnet:$isTestnet});
    $dataPacket = await callMetaStellar('getDataPacket', {});
    updateAccountInfo();
    loading = false;
    console.log(response);
}

</script>

<div class='shadow-card' style="padding:5px; margin:0px; display:flex;">
    {#if loading}
        <div style="display:flex; flex-direction:column; margin:auto;">
            <P>Loading...</P>
        </div>
    {:else}
        <div style="display:flex; flex-direction:column;">
            <P>Claimable Balance</P>
            <div class='simple-card' style="margin:2px; padding:0.5em;">
                <P>{amount} {code}</P>
                <P size="xs">{issuer}</P>
            </div>
            <P size="xs">from: {sender}</P>
        </div>
        <Button color="blue" style="height:45px; margin:auto;" on:click={claim}>Claim</Button>
    {/if}
    
</div>

<style>
    
</style>