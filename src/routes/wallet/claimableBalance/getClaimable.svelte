<script lang='ts'>
import {updateAccountInfo} from '../updateData';
import { Button, P } from 'flowbite-svelte';
//https://horizon-testnet.stellar.org/claimable_balances?claimant=GBUILN7TAGOJ4OPTJMYGTVAOKIBAMSW4KYKNZPKQWQBVKBRVVDOREVEW
import { callMetaStellar } from '$lib/callMetaStellar';
import { dataPacket, isTestnet} from '$lib/wallet-store';

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
    .addOperation(claimBalance)
    .setNetworkPassphrase( $isTestnet?StellarSDK.Networks.TESTNET:StellarSDK.Networks.PUBLIC)
    .setTimeout(180)
    .build();

    let response = await callMetaStellar('signAndSubmitTransaction', {transaction:tx.toXDR(), testnet:$isTestnet});
    await updateAccountInfo();
    loading = false;
    console.log(response);
}

</script>

<div class='shadow-card' style="padding:5px; margin:0px; display:flex;">
    <div style="display:flex; flex-direction:column;">
        <P>Claimable Balance</P>
        <div class='simple-card' style="margin:2px; padding:0.5em;">
            <P>{amount} {code}</P>
            <P size="xs">{issuer}</P>
        </div>
        <P size="xs">from: {sender}</P>
    </div>
    
        <Button color="blue" style="height:45px; margin:auto;" on:click={claim}>Claim</Button>
    
</div>