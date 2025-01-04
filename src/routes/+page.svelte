<script lang='ts'>
	import { screen } from '$lib/ui-store';
    import {Card, NftPoster, YoutubePoster} from '@metastellar/ui-library';
    import { onMount } from "svelte";

    import { env } from "$lib/env";
    import {stellar_rpc_mainnet_endpoint} from '$lib/constants'

    import WalletIcon from '$lib/images/front-icons/wallet.png';
    import DocsIcon from '$lib/images/front-icons/docs.png';
    import FAQIcon from '$lib/images/front-icons/faq.png';
    import labIcon from '$lib/images/front-icons/lab.png'; 
    


    const mouse_movement_record_send_url = env.VITE_MOUSE_MOVEMENT_DATA_SEND_URL;

    let titles = {
        wallet: "Wallet",
        news: "News",
        docs: "Documentation",
        chat: "Chat"
    }
    
    let screens = {
        lg: 1200,
        md: 992,
        sm: 768,
        xs: 576
    }

    function handleResize(){
        if(window.innerWidth > screens.md){
            $screen = 'lg';
            titles.docs = "Documentation";
        }
        if(window.innerWidth < screens.lg){
            $screen = 'md';
            titles.docs = "Docs";
        }
        if(window.innerWidth < screens.md){
            $screen = 'sm';
        }
        if(window.innerWidth < screens.sm){
            $screen = 'xs';
        }
    }
    onMount(() => {
        handleResize();
    });

    interface AssetAccount {
        code: string, // This asset's code
        issuer: string, // The Stellar address of this asset’s issuer.
    }

    const assetInfo: AssetAccount = {
        code: "FBO2",
        issuer: "GBSUYFOI5SWH7MWA43MQGXH3CP6DMBU3AKAU7ZGTEN7EKCNSVQWJUXOL"
    }

</script>
<svelte:window on:resize={handleResize} />


<div class="uk-container">
    <br/>
    <div id='home-grid'>
        <div class='homeCard'>
            <a href="/wallet">
            
                <Card class="py-7 px-5 w-72 h-72" shadow>
                    <p>Wallet</p>
                    <img style="padding:1em;" alt="drawing of a wallet" src={WalletIcon}/>
                </Card>
            </a>
        </div>

        <div class='homeCard'>
            <a href="/docs">
                <div>
                    <Card class="py-7 px-5 w-72 h-72" shadow>
                        <p>Docs</p>
                        <img style="padding:1em;" alt="drawing of a clipboard and computer" src={DocsIcon}/>
                    </Card>
                </div>
            </a>
        </div>
        <div class='homeCard'>
            <a href="/faq">
                <Card class="py-7 px-5 w-72 h-72" shadow>
                    <p>FAQ</p>
                    <img style="padding:1em;" alt="A drawing of a conversation with a chatbot" src={FAQIcon}/>
                </Card>
            </a>
        </div>
        <div class='homeCard'>
            <a href="/transactionBuilder">   
                <Card class="py-7 px-5 w-72 h-72" shadow>
                    <p>Stellar Lab 2.0</p>
                    <img style="padding:1em;" alt="A drawing of a blowtorch and a science flask" src={labIcon}/>
                </Card>
            </a>
        </div>
    </div>
</div>

<style>
    a {
        text-decoration: none;
        color:black;

    }
    .uk-container{
        display:grid;
    }
    #home-grid{
        place-self: center;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 10px;
        
        
        align-self: center;
    }
    #home-grid *{
    
        place-self: center;

    }
	.uk-flex{
		gap: 10px;
    }
    .uk-card{
        cursor: pointer;
    }
    /* .uk-card:hover{
        animation: both 3s float infinite;
    } */



    .homeCard:hover{
        animation: float 0.3s ease forwards;
    }

    @keyframes float {
	0% {
		box-shadow: 0 5px 15px 0px rgba(0,0,0,0.6);
		transform: translatey(0px) scale(1);
	}
	100% {
		box-shadow: 0 25px 15px 0px rgba(0,0,0,0.2);
		transform: translatey(-5px) scale(1.01);

	}

}

    .uk-container:has(.ms-frame:hover) .ms-frame:not(:hover) {
        filter: blur(5px);
    }
</style>