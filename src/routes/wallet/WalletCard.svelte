<script lang="ts">
	import { Chasing } from 'svelte-loading-spinners';
	import copy from 'copy-to-clipboard';
    import { Toast } from '$lib/utils/index';
	//import { getAirDropData, claimClaimableBalance } from './../../lib/services/index.ts';
	import { Card } from '@metastellar/ui-library';
	import { callMetaStellar } from '$lib/callMetaStellar';
    import {dataPacket, isTestnet, currentView} from '$lib/wallet-store';
    
   
    
    import {P, Button, Indicator, Tooltip, Dropdown, DropdownItem, DropdownHeader} from "flowbite-svelte";
    import {onMount} from 'svelte';
    import createStellarIdenticon from "./stellarIcons";
    
    let iconSRC = `https://id.lobstr.co/${$dataPacket.currentAddress}.png`;
    
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

    function createAccount(){
        let name = prompt("Enter new account name");
        callMetaStellar('createAccount', {name:name, testnet:$isTestnet});
    }

    function generateSetAccount(address:string){
        return async function(){

            await callMetaStellar('setCurrentAccount', {address:address});
            $dataPacket = await callMetaStellar('getDataPacket', {});
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
    
    function setView(view:string){
        $currentView = view;
    }

    let accounts = $dataPacket.accounts;

    let balance = $isTestnet? ($dataPacket).testnetXLMBalance : ($dataPacket).mainnetXLMBalance;
    
    $: balance = $isTestnet? ($dataPacket).testnetXLMBalance : ($dataPacket).mainnetXLMBalance;
    $: iconSRC = getIdenticon($dataPacket.currentAddress);
    
</script>
<br/>
<br/>

<Card style="margin-bottom:2em;" shadow>
    <div>
        <div style="display:flex; flex-direction:row; justify-content:space-between;">
            <div style="width:fit-content">
                <Button color="light" style="margin-bottom:10px;" >
                    <div  style="display:flex; flex-gap:3; ">
                        <div style="padding:10px;">
                            <img style="padding:5px;" on:click={()=>quickCopy($dataPacket.currentAddress)} alt={"addressIcon"} width="35" height="35" src={iconSRC}/>
                        </div>
                        <Tooltip>icon provided by lobstr.co</Tooltip>
                        <div style="display:flex; flex-direction:column;">
                            <P size="2xl" style="margin:0px;">{$dataPacket.name}</P>
                            <div style="display:flex;">
                                <P size='xs'>{$dataPacket.currentAddress}</P>
                                <Button style="margin-left:5px;" color='light' size={'sm'} on:click={(e)=>{e.preventDefault(); e.stopPropagation();quickCopy($dataPacket.currentAddress)}}><svg xmlns="http://www.w3.org/2000/svg" height="10px" viewBox="0 -960 960 960" width="10px" fill="#5f6368"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg></Button>
                            </div>
                            {#if $dataPacket.fedName} 
                                <P size="sm">{$dataPacket.fedName}</P>
                            {/if}
                        </div>

                    </div>

                </Button>
                <Dropdown style="width:fit-content;">
                    
                    <DropdownHeader>
                        <Button color='light' on:click={createAccount}>createAccount</Button>
                    </DropdownHeader>
                    {#each $dataPacket.accounts as account}
                    <DropdownItem style="z-index:9999999999; background-color:white;" on:click={generateSetAccount(account.address.toString())}>
                        <div  style="display:flex; flex-gap:3; ">
                            <div style="padding:10px;">
                                <img style="padding:5px;" alt={"addressIcon"} width="35" height="35" src={getIdenticon(account.address.toString())}/>
                            </div>
                            <div style="display:flex; flex-direction:column;">
                                <P size="2xl" style="margin:0px;">{account.name}</P>
                                <div style="display:flex;">
                                    <P size='xs'>{account.address}</P>
                                    
                                </div>
                            </div>
    
                        </div>
                    </DropdownItem> 
                    {/each}
                    
                </Dropdown>
            </div>
            <Button on:click={flipNetwork} color="light" class="relative" size="sm" style="height:40px;">
                {$isTestnet?"testnet":"mainnet"}
                <span class="sr-only">Network Indicator</span>
                {#if $isTestnet}
                <Indicator color="green" border size="lg" placement="top-right" class="text-xs font-bold"></Indicator>
                {/if}
                {#if !$isTestnet}
                <Indicator color="orange" border size="lg" placement="top-right" class="text-xs font-bold"></Indicator>
                {/if}
            </Button>
        </div>

        <Button on:click={showAddress} color="light">recieve</Button>
        <Button on:click={openSendXLM} color="light">send</Button>
        <p>{balance} XLM</p>
    </div>

    <div style="display:flex;">
        <Button color='light' style="border:none;" shadow={$currentView !== 'send'} on:click={()=>{setView('send')}} >
               Send
        </Button>
        <Button color='light' style="border:none;" shadow={$currentView !== 'sendXLM'} on:click={()=>{setView('sendXLM')}} >
            Send XLM
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
</Card>