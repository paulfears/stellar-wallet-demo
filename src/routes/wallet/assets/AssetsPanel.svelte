<script lang='ts'>

	
    import AssetSelect from '$lib/components/TransactionBuilder/AssetSelect.svelte';
    import { Card, Hr, Input, P, Button, Popover, Toast } from 'flowbite-svelte';
    import { Asset, TransactionBuilder, BASE_FEE, Networks, Horizon, Operation} from 'stellar-sdk';
    import {isTestnet, dataPacket} from '$lib/wallet-store';
    import type { DataPacket } from '$lib/wallet-store';
    import { callMetaStellar } from '$lib/callMetaStellar';
    
    import copyicon from '$lib/images/copy.svg';
    import copy from "copy-to-clipboard";
    let currentAsset = Asset.native();
    let trustAmount = '0';


    async function changeTrust(asset:Asset, limit:string){
            
            const passpharase =  $isTestnet? Networks.TESTNET : Networks.PUBLIC

            const server = new Horizon.Server($isTestnet?'https://horizon-testnet.stellar.org':'https://horizon.stellar.org');
            const account = await server.loadAccount($dataPacket.currentAddress);
            const txnBuilder = new TransactionBuilder(account, {fee:BASE_FEE, networkPassphrase: passpharase});
        
			let Asset1 = new Asset(asset.code, asset.issuer);

            txnBuilder.addOperation(
                
                Operation.changeTrust({'asset':Asset1,'limit':limit,})

            )
            txnBuilder.setTimeout(3600);
            let txnXDR = txnBuilder.build().toXDR();
            await callMetaStellar('signAndSubmitTransaction', {transaction:txnXDR, testnet:$isTestnet});
            
    }

    async function handleChangeTrust(){
        await changeTrust(currentAsset, trustAmount);
    }

    async function handleChangeTrustAmount(e:any){
        trustAmount = String(e.target.value);
    }

    function chopAddress(address:string){
        return address.slice(0,6)+"..."+address.slice(address.length-6, address.length);
    }

    let toastStatus = false;
    function ezCopy(text:string){
        copy(text);
        toastStatus = true;
        setTimeout(()=>{toastStatus = false}, 2000);
    }

    

    console.log($dataPacket.testnetAssets);
    let assets = [];
    $: $isTestnet?assets = $dataPacket.testnetAssets: assets = $dataPacket.mainnetAssets
</script>

<div class='shadow-card'>
    <h3 class="mb-4 font-bold text-2xl">Assets</h3>
    {#if $isTestnet}
        <P size="lg">Testnet</P>
    {:else}
        <P size="lg">Mainnet</P>
    {/if}
    <div style="display:flex; gap:10%;">
        <div>
            <Toast bind:toastStatus={toastStatus}>Copied to clipboard</Toast>
            <div style="overflow-y:scroll; height:400px;">
                {#each assets as asset}
                <Card style="width:450px;">
                    <P size="sm">{asset.asset_code}</P>
                    
                    {#if asset.asset_issuer !== undefined && asset.asset_issuer !== 'native'}
                        <div style="display:flex; gap:5px;">
                            <P size="xs">{chopAddress(asset.asset_issuer)}</P>
                            <Popover title={asset.asset_code}>{asset.asset_issuer}</Popover>
                            <img src={copyicon} alt="copy" on:click={ezCopy(asset.asset_issuer)} style="width:20px; height:20px; cursor:pointer;"/>
                        </div>
                        
                        
                    {/if}
                    <P size="sm">{asset.balance} {asset.asset_code}</P>
                </Card>  
                {/each}
            </div>
        </div>
        <div>
        <Card>
            <P size="lg">Add Assets</P>
            <P size="xl">{currentAsset.code}</P>
            {#if currentAsset.issuer !== undefined}
                <P size="xs">{chopAddress(currentAsset.issuer)}</P>
            {/if}
            <AssetSelect network={$isTestnet?'testnet':'mainnet'} bind:selectedAsset={currentAsset}/>
            <Hr/>
            <Input placeholder="Trust Limit" on:change={handleChangeTrustAmount} type="number"/>
            <Button color="light" on:click={handleChangeTrust}>Add Trustline</Button>
        </Card>
        </div>

    </div>
</div>