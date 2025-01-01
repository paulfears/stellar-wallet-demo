<script lang="ts">
	
	import ConnectDisp from '$lib/components/connectDisp/ConnectDisp.svelte';
    import {Card} from '@metastellar/ui-library';
    import {Chasing} from 'svelte-loading-spinners'
    import copy from "copy-to-clipboard";
    import {connected, dataPacket, isTestnet} from '$lib/wallet-store';
	import {Toast as toast} from "$lib/utils"
    import SendXML from '../components/XML/SendXml.svelte';
    import { Button } from 'flowbite-svelte';
    import AssetsPanel from './assets/AssetsPanel.svelte';
    import WalletCard from './WalletCard.svelte';
    import Transactions from './transactions.svelte';

    export let currentView = "sendXLM";

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

</script>
{#if $connected}
    {#if $dataPacket.currentAddress !== "null"}
        <div>
            <div id="midContainer"  class="uk-container">
                <WalletCard/>
                
                    
                    <button on:click={()=>{setView('sendXLM')}} >
                        <Card class="py-4 lg:px-12 min-h-[80px] justify-center" shadow={currentView !== 'sendXLM'}>
                            <span>Send XLM</span>
                        </Card>
                    </button>
                    
                    
                    <button on:click={()=>{setView('assets')}}>
                        <Card class="py-4 lg:px-12 min-h-[80px] justify-center" shadow={currentView !== 'assets'} >
                            Assets
                        </Card>
                    </button>
                    <button on:click={()=>{setView('transactions')}}>
                        <Card class="py-4 lg:px-12 min-h-[80px] justify-center" shadow={currentView !== 'transactions'} >
                            Transaction explorer
                        </Card>
                    </button>
                
                
                <div class="mt-2">
                    {#if currentView == 'sendXLM'}
                        <SendXML/>
                    {:else if currentView == 'assets'}
                        <AssetsPanel/>
                    {:else if currentView == 'transactions'}
                        <Transactions/>
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