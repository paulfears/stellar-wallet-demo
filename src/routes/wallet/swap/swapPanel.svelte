<script lang='ts'>
	import { testnet } from './../../../store.ts';

import * as StellarSdk from '@stellar/stellar-sdk';
import { dataPacket, isTestnet, type walletAsset } from '$lib/wallet-store';
import AssetSelect from '$lib/components/TransactionBuilder/AssetSelect.svelte';


import { ChevronDownOutline, ArrowDownOutline } from 'flowbite-svelte-icons';
import { Button, Dropdown, DropdownItem, DropdownDivider, P, Input } from 'flowbite-svelte';
import { callMetaStellar } from '$lib/callMetaStellar';
import { Circle2 } from 'svelte-loading-spinners';

    

let assets:walletAsset[] = [];
let path:StellarSdk.Asset[] = [];


let inputAsset = StellarSdk.Asset.native();
let inputAmount:string = "";

let outputAsset:StellarSdk.Asset|null = null;
let outputAmount:any = null;

async function getPath(horizonServer:StellarSdk.Horizon.Server, sourceAsset:StellarSdk.Asset, destAsset:StellarSdk.Asset, amount:number){
    try {
        console.log(sourceAsset, destAsset, amount);

        const paths = await horizonServer.strictSendPaths(
            sourceAsset,
            amount.toString(),
            [destAsset]
        ).call();
        
        console.log(paths);
        let tempPath = paths.records[0].path;
        if(tempPath.length === 0){
            path = []
        }
        else{
            let output_path = []
            for(let i = 0; i<tempPath.length; i++){
                output_path.push(new StellarSdk.Asset(tempPath[i].asset_code, tempPath[i].asset_issuer));
            }
            path = output_path;
        }
        return paths;
        
    } catch (error) {
        console.error('Error fetching path price:', error);
        throw error;
    }
}

let calculatingPrice = false;
async function handleChange(inputAsset, inputAmount, outputAsset){
    if(inputAsset === null || inputAmount === "" || outputAsset === null){
        return;
    }
    calculatingPrice = true;
    console.log(outputAsset);

    
    let url;
    if($isTestnet){
        url = 'https://horizon-testnet.stellar.org';
    }
    else{
        url = 'https://horizon.stellar.org';
    }
    const horizon = new StellarSdk.Horizon.Server(url);
    let paths = await getPath(horizon, inputAsset, outputAsset, inputAmount);
    console.log(paths);
    if(paths.records.length === 0){
        outputAmount = null;
    }
    outputAmount = paths.records[0].destination_amount;
    calculatingPrice = false;
    
}

async function swap(){
    if(outputAsset === null){
        return
    }
    outputAsset = new StellarSdk.Asset(outputAsset.code, outputAsset.issuer);
    let swapTransaction = await generateSwap(inputAsset, inputAmount, outputAsset, outputAmount, $isTestnet, path);
    console.log(swapTransaction);
    const liveXDR = swapTransaction.build().toXDR();
    console.log(liveXDR);
    let output = await callMetaStellar('signAndSubmitTransaction', {transaction:liveXDR, testnet:$isTestnet});
    return output;
}

async function generateSwap(inputAsset:StellarSdk.Asset, inputAmount:string, outputAsset:StellarSdk.Asset, outputMin:string, testnet:boolean, path:StellarSdk.Asset[]){
    let currentAddress = await callMetaStellar('getAddress', {});
    let url;
    if(!path){
        path = [];
    }
    if(testnet){
        url = 'https://horizon-testnet.stellar.org';
    }
    else{
        url = 'https://horizon.stellar.org';
    }
    const horizon = new StellarSdk.Horizon.Server(url);
    const account = await horizon.loadAccount(currentAddress);
    let trustLimit = 0;
    let lineExists = false;
    console.log("checking balances");
    for(let i = 0; i < account.balances.length; i++){
                let balance = account.balances[i];
                if(
                    balance.asset_type !== 'native' 
                    && balance.asset_code === outputAsset.code 
                    && balance.asset_issuer === outputAsset.issuer
                ){
                    let limit = parseFloat(balance.limit);
                    lineExists = true;
                    let balance = parseFloat(balance.balance);
                    if(limit-balance < parseFloat(outputMin)+1000){
                        trustLimit = parseFloat(outputMin)+(limit-balance)+1000;
                        break;
                    }
                    else{
                        break;
                    }
                }
    }
    if(!lineExists){
        trustLimit = parseFloat(outputMin)+1000;
    }

    console.log(account);
    const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET
    })
    if(trustLimit > 0){
        // First operation: Set up trustline
        console.log("setting up output asset");
        console.log(outputAsset);
        transaction.addOperation(StellarSdk.Operation.changeTrust({
            asset: outputAsset,
            limit: String(trustLimit)// Set your desired trust limit
        }))
        console.log("successfully added changetrust op");
    }
        // Second operation: Perform path payment
    console.log("building Path payment");
    transaction.addOperation(StellarSdk.Operation.pathPaymentStrictSend({
            sendAsset: inputAsset,
            sendAmount: inputAmount,
            destination: currentAddress,
            destAsset: outputAsset,
            destMin: outputMin, // Minimum amount you're willing to receive
            path: path,
    }));
    transaction.setTimeout(180)
    console.log(transaction);
    return transaction;
}

let network:'mainnet'|'testnet' = $isTestnet?'testnet':'mainnet';
$: $isTestnet?((assets=$dataPacket.testnetAssets)):(assets=$dataPacket.mainnetAssets);
$: $isTestnet?(network = 'testnet'):(network = 'mainnet');

$: currentAsset=assets[assets.length-1];

$: handleChange(inputAsset, inputAmount, outputAsset);


let dropdownOpen = false;
function generateSelectAsset(asset:walletAsset){
    return function(){
        currentAsset = asset;
        inputAsset = new StellarSdk.Asset(asset.asset_code, asset.asset_issuer);
        dropdownOpen = false;
    };
}


</script>

<div class='shadow-card'>
    <div class='simple-card' style='margin:0px; padding:0px 10px; background-color:#f9f9f9'>
        <p>Input Asset</p>

        <div style='display:flex;'>
            <Button color='light'>{currentAsset.asset_code} <ChevronDownOutline/></Button>
            <Dropdown class="w-96 h-48 shadow overflow-y-auto" bind:open={dropdownOpen}>
                {#if assets !== undefined}
                    <DropdownItem on:click={generateSelectAsset(assets[assets.length-1])}>
                        <P>{assets[assets.length-1].asset_code}</P>
                        <P size='xs'>{assets[assets.length-1].balance}</P>
                    </DropdownItem>
                    <DropdownDivider/>
                    
                    {#each assets as asset}
                    {#if asset.asset_code !== 'XLM'}
                    <DropdownItem  on:click={generateSelectAsset(asset)}>
                        <div>
                        <P>{asset.asset_code}</P>
                        <P size='xs'>{asset.balance}</P>
                        </div>
                    </DropdownItem>
                    {/if}
                    {/each}
                {/if}
            </Dropdown>
            <Input placeholder='amount' bind:value={inputAmount}/>
        </div>
        {#if currentAsset.asset_issuer !== undefined && currentAsset.asset_issuer !== 'native'}
        <P style="padding-left:0.625rem;" size='xs'>{currentAsset.asset_issuer}</P>
        {/if}
        <p>Balance:{currentAsset.balance} {currentAsset.asset_code}</p>

        
    
    </div>
    <div style="display:flex; justify-content:center; padding:20px;">
        <ArrowDownOutline size='xl'/>
    </div>
    <p>Output Asset</p>
    <AssetSelect bind:selectedAsset={outputAsset} bind:network={network}/>
    <div style="display:flex">
        <p>{outputAmount===null?"no liquidity":outputAmount+" "+outputAsset.code} </p>
        {#if calculatingPrice}<Circle2 size="25"/>{/if}
    </div>
    <br/>
    <Button on:click={swap} color='light'>Swap</Button>
</div>