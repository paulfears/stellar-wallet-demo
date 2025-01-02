<script lang="ts">
	
	import ConnectDisp from '$lib/components/connectDisp/ConnectDisp.svelte';
    import {Card} from '@metastellar/ui-library';
    import {Chasing} from 'svelte-loading-spinners'
    import {connected, dataPacket, isTestnet, currentView} from '$lib/wallet-store';
	
    import SendXML from '../components/XML/SendXml.svelte';
    
    import AssetsPanel from './assets/AssetsPanel.svelte';
    import WalletCard from './WalletCard.svelte';
    import SendPanel from './send/sendPanel.svelte';
    import Transactions from './transactions.svelte';
    import SwapPanel from './swap/swapPanel.svelte';

    

//   let xlmBalance:number = 0;
    // async function getWalletBallance() {
    //     let wallet = MetaStellarWallet.loadFromState($walletData);
    //     let balance = await wallet.getBalance();
    //     console.log("balance", balance);
    //     let data = wallet.exportState();
    //     walletData.set(data);
    //     xlmBalance = balance;
    //     return balance;
    // }
    
    const setView = (view:string) => {
        currentView = view;
        console.log('view ', currentView);
    }
    


    //Fund the testnet Account if not Funded
    $: $currentView = $currentView;
</script>
{#if $connected}
    {#if $dataPacket.currentAddress !== "null"}
        <div>
            <div  class="uk-container">
                <WalletCard/>
                
                    
                
                
                <div class="mt-2">
                    {#if $currentView == 'sendXLM'}
                        <SendXML/>
                    {:else if $currentView == 'assets'}
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
        
        <div style="margin-top:20%; display:flex; width:100%; height:100%; justify-content:center;">    
            <Chasing/>
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