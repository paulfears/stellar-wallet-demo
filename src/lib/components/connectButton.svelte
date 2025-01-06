<script lang="ts">
	import { callMetaStellar } from '$lib/callMetaStellar';

    
    import ConnectImg from '$lib/images/Connect.gif';
    import { fade, scale } from 'svelte/transition';
    
    import {Modal} from 'flowbite-svelte'
    import {Button} from 'flowbite-svelte';


    import {connected, dataPacket, isTestnet} from '$lib/wallet-store';
    import MMlogo from '$lib/images/MMlogo.png';
    
    
    

    let isPressed = false;

    function pressButton() {
        isPressed = true;
        setTimeout(() => {
            isPressed = false;
        }, 200);
    }

    let flaskNotDetected:boolean;
    
    
    async function connectSnap(){
        $connected = await callMetaStellar('connect', {});
        $dataPacket = await callMetaStellar('getDataPacket', {testnet:($isTestnet)});
    }


   
    
</script>
{#if !($connected)}
<Button color="light" on:click={connectSnap} >
    <img src={MMlogo} alt="Metamask Logo" class="w-6 h-6"/>
    Connect
</Button>
{/if}

{#if ($connected)}
<Button color="yellow"  style="cursor:none" on:click={connectSnap} >
    <img src={MMlogo} alt="Metamask Logo" class="w-6 h-6"/>
    Connected
</Button>
{/if}
<style>

    @keyframes button-press {
     0% { transform: scale(1); }
     25%{ transform: scale(0.7); }
     90% { transform: scale(1.5); }
     100% { transform: scale(1); }
    }
</style>