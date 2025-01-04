<script lang="ts">
	import { MiniumBalance } from './../../lib/wallet-store.ts';
	
	
	import ConnectDisp from '$lib/components/connectDisp/ConnectDisp.svelte';
    import {Card} from '@metastellar/ui-library';
    import {Circle2} from 'svelte-loading-spinners'
    import {connected, dataPacket, isTestnet, currentView, lastUpdate, accountInfo, claimableBalances} from '$lib/wallet-store';
	import * as StellarSdk from '@stellar/stellar-sdk';
    
    
    import AssetsPanel from './assets/AssetsPanel.svelte';
    import WalletCard from './WalletCard.svelte';
    import SendPanel from './send/sendPanel.svelte';
    import Transactions from './transactions.svelte';
    import SwapPanel from './swap/swapPanel.svelte';
    import { callMetaStellar } from '$lib/callMetaStellar';
    import { onMount } from 'svelte';
    

    


    async function updateAccountInfo(){
        console.log("updateInfoCalled");
        if($connected){
            let url = $isTestnet?'https://horizon-testnet.stellar.org':'https://horizon.stellar.org';
            if($connected){
                console.log("updating wallet data");
                $dataPacket = await callMetaStellar('getDataPacket', {testnet:($isTestnet)});
                let server = new StellarSdk.Horizon.Server(url);
                let account = await server.loadAccount($dataPacket.currentAddress);
                console.log(account);
                $claimableBalances = await server.claimableBalances().claimant($dataPacket.currentAddress).call();
                console.log(claimableBalances);
                $accountInfo = account;
                
                //2 base reserves + numSubEntries + numSponsoring - numSponsored) * baseReserve + liabilities.selling
                
                
            }
            $lastUpdate = new Date().getTime();
            
        }
        
    }

    function accountInfoTimer(){
        console.log("timer called");
        console.log($lastUpdate);
        try{
            if(((new Date()).getTime())-$lastUpdate > 59_999){
                updateAccountInfo();
            }
        }
        finally{
            setTimeout(accountInfoTimer, 60_000);
        }
    }

    onMount(()=>{
        console.log("page mounted")
        $lastUpdate = new Date().getTime();
        updateAccountInfo();
        accountInfoTimer();
    })

    //Fund the testnet Account if not Funded
    $: $currentView = $currentView;
</script>


{#if $connected}
    {#if $dataPacket.currentAddress !== "null"}
        <div>
            <div  class="uk-container">
                <WalletCard/>
                
                    
                
                
                <div class="mt-2">
                    {#if $currentView == 'assets'}
                        <AssetsPanel/>
                    {:else if $currentView == 'transactions'}
                        <Transactions/>
                    {:else if $currentView == 'send'}
                        <SendPanel/>
                    {:else if $currentView == 'swap'}
                        <SwapPanel/>
                    {/if}
                </div>     
            </div>
        </div>
    {:else} <!--Connected but datapacket is still not loaded-->
        
    <div style="display:flex; height:100%; transform:translateY(50%); text-align:center; align-content:center; flex-direction:column; justify-content:center;">
        <p>Connecting to MetaMask</p>
        <div style="display:flex; justify-content:center; padding:30px; margin:auto;">
        <Circle2 size={100}/>
        </div>
    </div>
    {/if}
{/if}

{#if !$connected}
    <ConnectDisp/>
{/if}

<style>
    button.active {
		/* box-shadow: 0 25px 15px 0px rgba(0,0,0,0.2);
		transform: translatey(-5px) scale(1.01); */
        color:#1d4ed8;
    }
</style>