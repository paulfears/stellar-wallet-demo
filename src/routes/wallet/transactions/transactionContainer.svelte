<script lang='ts'>
	import { isTestnet, dataPacket} from '$lib/wallet-store';
    import * as StellarSDK from '@stellar/stellar-sdk';
    import {P} from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import { Circle } from 'svelte-loading-spinners';
    
    export let txn:StellarSDK.Horizon.ServerApi.TransactionRecord;
    let operations:StellarSDK.Horizon.ServerApi.OperationRecord[] = [];
    let horizon = new StellarSDK.Horizon.Server($isTestnet?'https://horizon-testnet.stellar.org':'https://horizon.stellar.org');
    
    function getEffects(){
    }

    function getOperations(){
        console.log("here");
        let ops = localStorage.getItem(`operations-${txn.id}`);
        
        if(ops === null){
            (horizon.operations().forTransaction(txn.id).call()).then((result)=>{
                operations = result.records;
                localStorage.setItem(`operations-${txn.id}`, JSON.stringify(operations));
            })
        }
        else{
            operations = JSON.parse(ops);
        }

    }
    
    onMount(getOperations);
    
    $:horizon = new StellarSDK.Horizon.Server($isTestnet?'https://horizon-testnet.stellar.org':'https://horizon.stellar.org');
    
</script>
<div class='simple-card' style="margin:5px; padding:10px; border:0.5px solid #bbb;">
    <div style='display:flex; overflow-x:auto;'>
        
        {#if operations.length > 0}
            {#each operations as op, index}
                    <P>{op.type.replaceAll('_',' ')}</P>
                    {#if index < operations.length-1}
                        <P style='margin-right:0.5em;margin-left:0.5em;'>&</P>
                    {/if}
            {/each}
        {:else}
            <Circle/>
        {/if}
        
    </div>
    <P size='xs'>{txn.hash}</P>
</div>
