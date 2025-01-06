<script lang="ts">
	import { updateWalletData } from '$lib/utils';
	
	
	import ConnectDisp from '$lib/components/connectDisp/ConnectDisp.svelte';
    import {Card} from '@metastellar/ui-library';
    import {Circle2} from 'svelte-loading-spinners'
    import {connected, dataPacket, isTestnet, currentView, lastUpdate, accountInfo, claimableBalances, notifications} from '$lib/wallet-store';
	import * as StellarSdk from '@stellar/stellar-sdk';
    
    
    import AssetsPanel from './assets/AssetsPanel.svelte';
    import WalletCard from './WalletCard.svelte';
    import SendPanel from './send/sendPanel.svelte';
    import Transactions from './transactions.svelte';
    import SwapPanel from './swap/swapPanel.svelte';
    import { callMetaStellar } from '$lib/callMetaStellar';
    import { onMount } from 'svelte';
    import { updateAccountInfo } from './updateData';
    

    


    
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
    $: $connected && updateAccountInfo();
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