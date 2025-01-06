<script lang="ts">
	
	import { ChevronDownOutline, QrCodeOutline, PaperPlaneOutline } from 'flowbite-svelte-icons';
	import { Circle2 } from 'svelte-loading-spinners';
	import copy from 'copy-to-clipboard';
    import { Toast } from '$lib/utils/index';
	//import { getAirDropData, claimClaimableBalance } from './../../lib/services/index.ts';
	import { Card } from '@metastellar/ui-library';
	import { callMetaStellar } from '$lib/callMetaStellar';
    import {dataPacket, isTestnet, currentView, accountInfo, notifications} from '$lib/wallet-store';
    import { screen } from '$lib/ui-store';
    
   
    
    import {P, Button, Indicator, Tooltip, Dropdown, DropdownItem, DropdownHeader, Avatar} from "flowbite-svelte";
    import {onMount} from 'svelte';
    import createStellarIdenticon from "./stellarIcons";
    import Notifcations from './Notifcations.svelte';
    import { updateAccountInfo } from './updateData';
    
    let iconSRC = `https://id.lobstr.co/${$dataPacket.currentAddress}.png`;
    let loading = false;
    let loadingMessege = "";

    function showAddress(){

        callMetaStellar('showAddress', {});
    }
    function flipNetwork(){
        if($isTestnet){
            $isTestnet = false;
        }
        else{
            $isTestnet = true;
        }
        
    }
    function getIdenticon(address:string){
        let iconCanvas = createStellarIdenticon(address);
        return iconCanvas.toDataURL();
    }

    function openSendXLM(){
        callMetaStellar('openSendXLM', {testnet:$isTestnet});
    }


    let AccountSelectorOpen = false;
    async function createAccount(){
        loadingMessege = 'Creating Account';
        loading = true;
        try{
            let name = prompt("Enter new account name");
            AccountSelectorOpen = false;
            
            await callMetaStellar('createAccount', {name:name, testnet:$isTestnet});
            loadingMessege = 'Refreshing Data';
            $dataPacket = await callMetaStellar('getDataPacket', {});
        }
        finally{
            loading = false;
        }
        
    }

    
    function generateSetAccount(address:string){
        return async function(){
            try{
                AccountSelectorOpen = false;
                loadingMessege = 'Setting Account';
                loading = true;
                await callMetaStellar('setCurrentAccount', {address:address});
                loadingMessege = 'refreshing Data';
                updateAccountInfo();
                $dataPacket = await callMetaStellar('getDataPacket', {});
                
            }
            finally{
                loading = false;
            }
            
        }
    }

    function quickCopy(text:string){
        copy(text);
        Toast({type:'success', desc:"Address copied"});
    }


    onMount(async ()=>{
        iconSRC = getIdenticon($dataPacket.currentAddress);
        $dataPacket = await callMetaStellar('getDataPacket', {});
        if($dataPacket.testnetXLMBalance === "0"){
            
            callMetaStellar('fund', {testnet:true}).then(async ()=>{$dataPacket = await callMetaStellar('getDataPacket', {})});

        }
    });
    
    

    function updateMiniumBalnce(account){
        try{
            let subentry_count = parseInt(account.subentry_count);
            let numSponsoring = parseInt(account.num_sponsoring);
            let numSponsored = parseInt(account.num_sponsored);
            let selling_liabilities = parseFloat(account.balances[account.balances.length-1].selling_liabilities);
            let miniumBalance = (2+subentry_count+numSponsoring-numSponsored)*0.5 + selling_liabilities;
            miniumBalanceDisp = 'required balance '+miniumBalance+' XLM';
            return miniumBalance;
        }
        catch(e){
            console.log("failed to calculate minium Balance");
            miniumBalanceDisp = "";
            return 0;
        }
    }

    async function setView(view:string){
        if($currentView === view){
            $currentView = 'none';
        }
        else{
            $currentView = view;
        }
    }

    let accounts = $dataPacket.accounts;

    let balance = $isTestnet? ($dataPacket).testnetXLMBalance : ($dataPacket).mainnetXLMBalance;
    let miniumBalanceDisp = "";
    let openNotications = false;
    $: balance = $isTestnet? ($dataPacket).testnetXLMBalance : ($dataPacket).mainnetXLMBalance;
    $: iconSRC = getIdenticon($dataPacket.currentAddress);
    $: updateMiniumBalnce($accountInfo)
    
</script>
<br/>
<br/>

<Notifcations bind:notifications={$notifications} bind:opened={openNotications}/>
<div style="display:flex; flex-wrap:wrap; gap:10px;">
<div class='shadow-card'>
    {#if loading}
    <div style="display:flex; text-align:center; align-content:center; flex-direction:column; justify-content:center;">
        <p>{loadingMessege}</p>
        <div style="display:flex; justify-content:center; padding:30px; margin:auto;">
        <Circle2 size={100}/>
        </div>
    </div>
    {:else}
    <div>
        <div style="display:flex; flex-direction:row; justify-content:space-between; flex-wrap:wrap;">
            <div style="display:flex; flex-grow:1;">
                <div class='flex-col'>
                    <Button color="light" style=" text-align:left; " >
                        <div  style="display:flex; width:100%; justify-content:start; ">
                            <Avatar size='md' rounded dot={$isTestnet?{ color: 'green', size: 'lg', placement: 'top-right' }:{ color: 'yellow', size: 'lg', placement: 'top-right' }} style="padding:5px;" on:click={()=>quickCopy($dataPacket.currentAddress)} alt={"addressIcon"} src={iconSRC}/>
                            <Tooltip>icon provided by lobstr.co</Tooltip>
                            <div style="display:flex; flex-direction:column;">
                                <div style='display:flex; margin-left:5px;'>
                                    <P size="2xl" style="margin:0px; word-wrap:break-word;">{$dataPacket.name}</P>
                                    <span style="padding:6px 0px;"><ChevronDownOutline  /></span>
                                </div>
                                {#if $dataPacket.fedName} 
                                    <P size="sm">{$dataPacket.fedName}</P>
                                {/if}
                            </div>

                        </div>

                    </Button>
                    <Dropdown placement="bottom-start" bind:open={AccountSelectorOpen} style="width:fit-content; overflow-y:auto; max-height:300px;">
                        
                        <DropdownHeader>
                            <Button color='light' on:click={createAccount}>createAccount</Button>
                        </DropdownHeader>
                        {#each $dataPacket.accounts as account}
                        <DropdownItem on:click={generateSetAccount(account.address.toString())}>
                            <div  style="display:flex; flex-gap:3; ">
                                <div style="padding:10px;">
                                    <img style="padding:5px;" alt={"addressIcon"} width="25" height="25" src={getIdenticon(account.address.toString())}/>
                                </div>
                                <div style="display:flex; flex-direction:column;">
                                    <P size="sm" style="margin:0px;">{account.name}</P>
                                    <div style="display:flex;">
                                        <P size='xs'>{account.address}</P>
                                        
                                    </div>
                                </div>
        
                            </div>
                        </DropdownItem> 
                        {/each}
                        
                    </Dropdown>
                    <div style="display:flex; justify-content:center; ">
                        {#if $screen > 600}
                            <P style='word-wrap:break-word;' size='xs'>{$dataPacket.currentAddress}</P>
                        {:else}
                            <P style='word-wrap:break-word; border-radius:1em; width:60vw;' size='xs'>{$dataPacket.currentAddress}</P>
                           <!-- <P size='xs'>{shortenAddress($dataPacket.currentAddress)}</P> -->
                        {/if}
                        <Button style="margin-left:5px; padding:5px!important;" color='light' size={'sm'} on:click={(e)=>{e.preventDefault(); e.stopPropagation();quickCopy($dataPacket.currentAddress)}}><svg xmlns="http://www.w3.org/2000/svg" height="10px" viewBox="0 -960 960 960" width="10px" fill="#5f6368"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg></Button>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; justify-content:space-around; margin-left:10px;">
                    <Button on:click={openSendXLM} class="!p-2" color='light'>
                        <PaperPlaneOutline style="transform:rotate(45deg);"/>
                    </Button>
                    <Tooltip placement='left' type='light'>send xlm</Tooltip>
                    <Button on:click={showAddress}  class="!p-2" color='light'>
                        <QrCodeOutline/>
                    </Button>
                    <Tooltip placement='bottom' type='light'>receive</Tooltip>
                </div>
            </div>
            


        </div>
        
 

        
        <P size={$screen > 820?'4xl':'xl'}>{balance} XLM</P>
        {#if balance === '0'}
            <P size='sm'>uncreated account</P>
        {:else}
            <P size='sm'>{miniumBalanceDisp?miniumBalanceDisp:'calculating required balance'}</P>
        {/if}
        
    </div>
    {/if}
</div>

<div class='shadow-card'>
    <div class={$screen < 745?'flex-row mt-4':'flex-col'} style="justify-content:space-around;">
        <Button on:click={()=>openNotications=true} color="light" class="relative" size="sm" style="height:40px;">
            Notifications
            <span class="sr-only">Network Indicator</span>
            <Indicator color="green" border size="xl" placement="top-right">
                <span class="text-white text-xs font-bold">{$notifications.length}</span>
            </Indicator>
        </Button>
        <Button on:click={flipNetwork} color="light" class="relative" size="sm" style="height:40px;">
            {$isTestnet?"testnet":"mainnet"}
            <span class="sr-only">Network Indicator</span>
            
        </Button>

    </div>
</div>

<div class='shadow-card' style="width:80vw;">
    <div style="display:flex; justify-content:start; gap:2px;">
        <Button color='light' style="border:none;" shadow={$currentView !== 'send'} on:click={()=>{setView('send')}} >
               Send
        </Button>
        
        
        <Button color='light' style="border:none;" shadow={$currentView !== 'assets'} on:click={(e)=>{e.preventDefault(); setView('assets')}}>
            Assets
        </Button>
        <Button color='light' style="border:none;" shadow={$currentView !== 'swap'} on:click={()=>{setView('swap')}}>
            Swap
        </Button>
        <Button color='light' style="border:none;" shadow={$currentView !== 'transactions'} on:click={()=>{setView('transactions')}}>
            
            Transaction explorer
            
        </Button>
    </div>
</div>
</div>
<style>
    .flex-col{
        display:flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .flex-row{
        display:flex;
        flex-direction: row;
        justify-content: space-between;
        gap:10px;
    }

</style>