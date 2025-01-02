<script lang='ts'>
    import {isTestnet, dataPacket, type walletAsset} from '$lib/wallet-store';
    import * as StellarSdk from '@stellar/stellar-sdk';
    import {callMetaStellar} from '$lib/callMetaStellar';
    import {Input, Dropdown, DropdownItem, Button, P, DropdownHeader, DropdownDivider} from 'flowbite-svelte';
    import { ChevronDownOutline } from 'flowbite-svelte-icons';
    import { balance } from '../../../store';

    let destination = '';
    let assetAmount = 0;

    async function createClaimableBalance(address:string, asset:StellarSdk.Asset, amount:string) {
        
        
      
        
        // Recipient's public key (replace with recipient's public key)
        const recipientId = address;

        
        try {
        
            
            // Create a simple claimable balance that can be claimed at any time
            const claimableBalanceOpereation = StellarSdk.Operation.createClaimableBalance({
                amount: amount, // Amount in XLM
                asset: asset, // Using native XLM asset
                claimants: [
                    new StellarSdk.Claimant(
                        recipientId,
                        StellarSdk.Claimant.predicateUnconditional() // Can claim at any time
                    )
                ]
            });
            return claimableBalanceOpereation;
        }
        catch (error) {
            console.error('Error creating claimable balance:', error);
            throw error;
        }
    }
    async function sendAsset(){

        const asset = currentAsset;
        const dest = destination;
        const amount = assetAmount;
        //check if asset is native; if native use sendXLM
        if(asset.asset_code === 'XLM'){
            //callMetaStellar('send')
        }
        let url = '';
        if($isTestnet){
            url = 'https://horizon-testnet.stellar.org';
        }
        else{
            url = 'https://horizon.stellar.org/';
        }
        let horizon = new StellarSdk.Horizon.Server(url);

        //check that dest exists if false append create account operation
        let destAccount = await horizon.loadAccount(dest);
        console.log(destAccount);

        //check if dest is opted into asset; append send asset operation
        

        if(destAccount.balances.length > 0){
            let optedIn = false;
            for(let i = 0; i < destAccount.balances.length; i++){
                let balance = destAccount.balances[i];
                if(
                    balance.asset_type !== 'native' 
                    && balance.asset_code === asset.asset_code 
                    && balance.asset_issuer === asset.asset_issuer
                )
                {
                    if(parseFloat(balance.limit) > parseFloat(balance.balance) + amount){
                        optedIn = true;
                        //createSendAssetOperation
                        //addConsent
                        const claimableBalanceOp = createClaimableBalance(dest, new StellarSdk.Asset(balance.asset_code, balance.asset_issuer), amount.toString());
                    }
                    else{
                        //create claimable balance

                    }
                    break;
                    
                }
            }
        }
        

        //else append create claimable balance operation


    }
    let assets:walletAsset[] = [];

    $: $isTestnet?(assets=$dataPacket.testnetAssets):(assets=$dataPacket.mainnetAssets);

    $: currentAsset=assets[assets.length-1];

    let dropdownOpen = false;
    function generateSelectAsset(asset:walletAsset){
        return function(){
            currentAsset = asset;
            dropdownOpen = false;
        };
    }
</script>
<div class='shadow-card'>
    {#if currentAsset !== undefined}
        <div class='simple-card' style='margin:0px; padding:0px 10px; background-color:#f9f9f9'>
            <p>Currency</p>

            <div style='display:flex;'>
                <Button color='light'>{currentAsset.asset_code} <ChevronDownOutline/></Button>
                <Dropdown class="w-96 h-48 shadow overflow-y-auto" bind:open={dropdownOpen}>
                    {#if assets !== undefined}
                        <DropdownItem on:click={generateSelectAsset(assets[assets.length-1])}>
                            <P>{assets[assets.length-1].asset_code}</P>
                            <P size='xs'>{assets[assets.length-1].balance}</P>
                        </DropdownItem>
                        <DropdownDivider/>
                        
                        {#each assets as asset}
                        {#if asset.asset_code !== 'XLM'}
                        <DropdownItem  on:click={generateSelectAsset(asset)}>
                            <div>
                            <P>{asset.asset_code}</P>
                            <P size='xs'>{asset.balance}</P>
                            </div>
                        </DropdownItem>
                        {/if}
                        {/each}
                    {/if}
                </Dropdown>
                <Input type='number' placeholder='amount'/>
            </div>
            {#if currentAsset.asset_issuer !== undefined && currentAsset.asset_issuer !== 'native'}
            <P style="padding-left:0.625rem;" size='xs'>{currentAsset.asset_issuer}</P>
            {/if}
            <p>Balance:{currentAsset.balance} {currentAsset.asset_code}</p>

        
        </div>
        <p>Recipient</p>
        <Input bind:value={destination} placeholder='address'/>
        <Button on:click={sendAsset} color='light'>Send</Button>
        
            
       
    {/if}

</div>

<style>
    p{
        padding:0.625rem;
    }
</style>