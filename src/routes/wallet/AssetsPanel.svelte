<script lang='ts'>

	
    import AssetSelect from '$lib/components/TransactionBuilder/AssetSelect.svelte';
    import { Card, Hr, Input, P, Button } from 'flowbite-svelte';
    import { Asset, TransactionBuilder, BASE_FEE, Networks, Horizon, Operation} from 'stellar-sdk';
    import {isTestnet, dataPacket} from '$lib/wallet-store';
    import type { DataPacket } from '$lib/wallet-store';
    import { callMetaStellar } from '$lib/callMetaStellar';
    import { testnet } from '../../store';

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
    
</script>


<div style="display:flex; justify-content:space-between;">
    <div>
        {#if $isTestnet}
            <P size="lg">Testnet</P>
            {#each $dataPacket.testnetAssets as asset}
            <Card style="width:450px;">
                <P size="xl">{asset.asset_code}</P>
                <P size="lg">{asset.balance} {asset.asset_code}</P>
            </Card>  
            {/each}
        {:else}
            <P size="lg">Mainnet</P>
            {#each $dataPacket.mainnetAssets as asset}
            <Card style="width:450px;">
                <P size="xl">{asset.asset_code}</P>
                <P size="lg">{asset.balance} {asset.asset_code}</P>
            </Card>  
            {/each}
        {/if}
    </div>
    <div>
    <Card>
        <P size="lg">Add Assets</P>
        
        <P size="xl">{currentAsset.code}</P>
        {#if currentAsset.issuer !== undefined}
            <P size="xs">{currentAsset.issuer.slice(0,4)+"..."+currentAsset.issuer.slice(currentAsset.issuer.length-4, currentAsset.issuer.length)}</P>
        {/if}
        <AssetSelect network={$isTestnet?'testnet':'mainnet'} bind:selectedAsset={currentAsset}/>
        <Hr/>
        <Input placeholder="Trust Limit" on:change={handleChangeTrustAmount} type="number"/>
        <Button color="light" on:click={handleChangeTrust}>Add Trustline</Button>
    </Card>
    </div>

</div>