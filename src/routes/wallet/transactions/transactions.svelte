
<script lang='ts'>
	
	
	
	
	import { isTestnet, dataPacket } from '$lib/wallet-store';
    import { Button, Card } from 'flowbite-svelte';

    

    import TransactionContainer from './transactionContainer.svelte';

    import type { accountStructure, txnData } from './types';

    import * as StellarSDK from '@stellar/stellar-sdk';
    import { onMount } from 'svelte';
    

    let StellarExpertNetwork = $isTestnet?'testnet':'public';
    let address = $dataPacket.currentAddress;

    

    let url = $isTestnet?'https://horizon-testnet.stellar.org':'https://horizon.stellar.org';
    let horizon = new StellarSDK.Horizon.Server(url);

    let transactions:StellarSDK.Horizon.ServerApi.TransactionRecord[] = [];


    let cursor:null|string = null;
    let lastKnownTxnId:null|string = null;
    let currentTxnData:StellarSDK.Horizon.ServerApi.TransactionRecord[] = [];




    


    function loadCachedTxnData(account:string, isTestnet:boolean){
        let rawTxnData = localStorage.getItem(`txnData-${account}-${isTestnet?'testnet':'mainnet'}`);
        let cursor = localStorage.getItem(`cursor-${account}-${isTestnet?'testnet':'mainnet'}`);
        console.log(rawTxnData);
        if(rawTxnData && cursor && rawTxnData !== '[]'){
            transactions = JSON.parse(rawTxnData);
            lastKnownTxnId = transactions[0].id;
        }
    }

    function cacheTxnData(address:string, isTestnet:boolean, cursor:string, data:StellarSDK.Horizon.ServerApi.TransactionRecord[]){
        localStorage.setItem(`txnData-${address}-${isTestnet?'testnet':'mainnet'}`, JSON.stringify(data));
        localStorage.setItem(`cursor-${address}-${isTestnet?'testnet':'mainnet'}`, cursor);
    }



    let loadTransactionChunk = async function(){
        
        let limit = 50;

        let isFirstChunk = false;
        let txns = horizon.transactions()
            .forAccount(address)
            .order('desc')
            .includeFailed(true)
            .limit(limit)
        if(cursor !== null){
            isFirstChunk = true;
            txns.cursor(cursor);
        }
        let result = await txns.call();
        console.log(txns);
        if(result.records.length > 0){
            transactions = [...transactions, ...result.records];
            let newTxnData:txnData[] = [];
            cursor = result.records[result.records.length-1].paging_token;
            if(isFirstChunk){
                lastKnownTxnId = result.records[0].id;
            }
            console.log(transactions);
            for(let i = 0; i<result.records.length; i++){
                let txnData = result.records[i];
                let hash = txnData.id;
                
            }
            return true;
        }
        else{
            return false;
        }
        
        
    }

    let searchForNewTxns = async function(){
        console.log("searching for new transactions");
        let limit = 50;
        let txns = horizon.transactions()
            .forAccount(address)
            .order('desc')
            .includeFailed(true)
            .limit(limit)
        let result = await txns.call();
        let records = result.records;
        let newTransactions = [];
        
        if(records.length === 0){
            //no transactions at all;
            console.log("no transctions");
            return [];
        }
        let newFirstId = records[0].id;
        console.log(records);
        if(newFirstId === lastKnownTxnId){
            console.log("new new transactions")
            return;
        }
        else{
            for(let i = 0; i<records.length; i++){
                console.log(records[i])
                console.log(records[i].id);
                console.log(lastKnownTxnId);
                if(records[i].id === lastKnownTxnId){
                    console.log("found");
                    console.log(records[i])
                    console.log(records[i].id);
                    lastKnownTxnId = newFirstId;
                    transactions = [...newTransactions, ...transactions]
                    console.log(transactions);
                    return newTransactions;
                }
                newTransactions.push(records[i]);
                console.log(newTransactions);
            }
            console.log("not found in this batch");
        }
        
    }

    

    let StellarChainNetwork = $isTestnet?'testnet.':'';
    let StellarChainLink = `https://${StellarChainNetwork}stellarchain.io/accounts/${address}`;



    

    function clearTxnCache(address:string, isTestnet:boolean){
        localStorage.removeItem(`txnData-${address}-${isTestnet?'testnet':'mainnet'}`);
        localStorage.removeItem(`cursor-${address}-${isTestnet?'testnet':'mainnet'}`);
    }

    onMount(async ()=>{
        //clearTxnCache(address, $isTestnet);
        loadTransactions(address, $isTestnet);
    })

    async function loadTransactions(address:string, isTestnet:boolean){
        console.log("loading transactions")
        transactions = [];
        cursor = null;
        loadCachedTxnData(address, isTestnet);
        
        if(transactions.length === 0){
            console.log("loading transaction chunks;")
            while(true){
                console.log("transactions");
                let newTransactions = await loadTransactionChunk()
                if(newTransactions){
                    continue;
                }
                else{
                    cacheTxnData(address, isTestnet, cursor as string, transactions);
                    break;
                }
            }
        }
        if(transactions.length > 0){
            console.log("more than one transactions");
            lastKnownTxnId = transactions[0].id;
        }
        searchForNewTxns();
    }


    async function loadDataChunk(){
        let prevCursor = cursor;
        loadTransactionChunk()
        .then(()=>{
            if(prevCursor !== cursor){
                cacheTxnData(address, $isTestnet, cursor as string, transactions)
            }
        });
    }
    

    //update horizon on testnet change
    $:horizon = new StellarSDK.Horizon.Server($isTestnet?'https://horizon-testnet.stellar.org':'https://horizon.stellar.org');
    $:loadTransactions($dataPacket.currentAddress, $isTestnet);
</script>

<div style="height:400px; width:100%; overflow-y:scroll">
    {#each transactions as txn}
        <TransactionContainer txn={txn}/>
    {/each}
    {#if transactions.length === 0}
        <center>Account has not been created yet</center>
    {/if}
</div>

<!--
<Card>
<a href={stellarExpertLink} target='_blank'>open Stellar Expert   🡥</a>
</Card>
<Card>
<a href={StellarChainLink} target='_blank'>open StellarChain.io    🡥</a>
</Card>
-->