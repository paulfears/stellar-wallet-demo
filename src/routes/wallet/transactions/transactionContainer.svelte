<script lang='ts'>
	import { isTestnet, dataPacket} from '$lib/wallet-store';
    import * as StellarSDK from '@stellar/stellar-sdk';
    import { P, Button, Indicator, Tooltip } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import { Circle } from 'svelte-loading-spinners';
    import TimeAgo from 'javascript-time-ago'
    import en from 'javascript-time-ago/locale/en'


    import {ArrowDownToBracketOutline, PaperPlaneOutline} from 'flowbite-svelte-icons';
    
    
    export let txn:StellarSDK.Horizon.ServerApi.TransactionRecord;
    let operations:StellarSDK.Horizon.ServerApi.OperationRecord[] = [];
    let horizon = new StellarSDK.Horizon.Server($isTestnet?'https://horizon-testnet.stellar.org':'https://horizon.stellar.org');
    let timeStamp = new Date(txn.created_at);

    TimeAgo.addLocale(en);
    const timeAgo = new TimeAgo('en-US');

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

    let link = `https://stellar.expert/explorer/${$isTestnet?'testnet':'public'}/tx/${txn.id}`
    
    $:horizon = new StellarSDK.Horizon.Server($isTestnet?'https://horizon-testnet.stellar.org':'https://horizon.stellar.org');
    
</script>
<div class='simple-card' style="margin:5px; padding:10px; border:0.5px solid #bbb;">
    <div style='display:flex; justify-content:space-between;'>
        <div style='display:flex; flex-direction:column;'>
            <div style='display:flex; overflow-x:auto;'>
                {#if txn.source_account === $dataPacket.currentAddress}
                    <span style=""><PaperPlaneOutline style='margin-right:0.5em; transform:rotate(45deg)'/></span>
                {:else}
                    <ArrowDownToBracketOutline style='margin-right:0.5em;'/>
                {/if}
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
        <div style='display:flex; flex-direction:column;'>
            <div style="display:flex;">
                {#if txn.successful}
                <Indicator style="margin:auto;" color='green'/>
                <Tooltip>Transacation Successful</Tooltip>
                {:else}
                <Indicator style="margin:auto;" color='red'/>
                <Tooltip>Transacation failed</Tooltip>
                {/if}
                <P size='sm' style="margin:auto;">{timeAgo.format(timeStamp)}</P>
                <Tooltip>{timeStamp.toLocaleTimeString('en-US', {
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric', 
                    minute: 'numeric', 
                    second: 'numeric' 
                  }
                  )}</Tooltip>
            </div>
            <a href={link} target='_blank'>Open Explorer</a>
        </div>
    </div>
</div>
