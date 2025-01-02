<script lang='ts'>
    import {isTestnet, dataPacket, type walletAsset} from '$lib/wallet-store';
    import * as StellarSdk from '@stellar/stellar-sdk';
    import {callMetaStellar} from '$lib/callMetaStellar';
    import {Input, Dropdown, DropdownItem, Button, P, DropdownHeader, DropdownDivider} from 'flowbite-svelte';
    import { ChevronDownOutline } from 'flowbite-svelte-icons';
    import { balance } from '../../../store';

    let destination = '';
    let assetAmount = 0;

    function createClaimableBalance(address:string, asset:StellarSdk.Asset, amount:string) {
        
        
      
        
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
    // For sending a custom asset:
    function createPaymentOp(dest:string, amount:string, code:string, issuer:string) {
        // Define the custom asset
        const customAsset = new StellarSdk.Asset(
            code, // Asset code
            issuer // Issuer's public key
        );

        // Then use it in the payment operation
        return StellarSdk.Operation.payment({
            destination: dest,
            asset: customAsset,
            amount: amount
        });
    }


    let loadingMsg = "";
    let loading = false;
    async function sendAsset(){
        // TEST address GBUILN7TAGOJ4OPTJMYGTVAOKIBAMSW4KYKNZPKQWQBVKBRVVDOREVEW
        loadingMsg = 'creating transaction';
        loading = true;
        const asset = currentAsset;
        const dest = destination;
        const amount = assetAmount;
        loadingMsg = 'checking sender address';
        const currentAddress = await callMetaStellar('getAddress', {});
        //check if asset is native; if native use sendXLM
        if(asset.asset_code === 'XLM'){
            loadingMsg = 'calling sendXLM';
            let result = new Error("something went wrong in sendXLM");
            try{
                //this function creates an account if one dosen't exist already.
                result = await callMetaStellar('transfer', {to:dest, amount:amount.toString()});
            }
            finally{
                loading = false;
                return result;
            }
        }
        loadingMsg = 'initalizing horizon server';
        let url = '';
        if($isTestnet){
            url = 'https://horizon-testnet.stellar.org';
        }
        else{
            url = 'https://horizon.stellar.org/';
        }
        let horizon = new StellarSdk.Horizon.Server(url);

        //check that dest exists if false append create account operation
        let destAccount = null;
        let signerAccount = null;
        signerAccount = await horizon.loadAccount(currentAddress);
        console.log(signerAccount);


        const transaction = new StellarSdk.TransactionBuilder(signerAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: $isTestnet?StellarSdk.Networks.TESTNET:StellarSdk.Networks.PUBLIC
        })
        
        loadingMsg = 'running preflight checks';
        try{
            destAccount = await horizon.loadAccount(dest);
            console.log(destAccount);
        }
        catch(e:any){
            if(e.toString() === 'NotFoundError: Not Found'){
                //create account operation
                transaction.addOperation(StellarSdk.Operation.createAccount({
                    destination: dest,
                    startingBalance: "10" // Amount of XLM to fund the account with
                }))
                console.log("append Create Account Op");
            }
            
        }

        //check if dest is opted into asset; append send asset operation
        
        let optedIn = false;
        if(destAccount !== null && destAccount.balances.length > 0){
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
                        
                    }
                    
                    break;
                    
                }
            }
        }
        
        if(optedIn){
            //append sendAssetOperation
            const sendAssetOp = createPaymentOp(dest, amount.toString(), asset.asset_code, asset.asset_issuer);
            transaction.addOperation(sendAssetOp);
        }
        else if(!optedIn){
            //TODO: add consent screen

            const claimableBalanceOp = createClaimableBalance(dest, new StellarSdk.Asset(asset.asset_code, asset.asset_issuer), amount.toString());
            transaction.addOperation(claimableBalanceOp);
        }

        


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
    <h3 class="mb-4 font-bold text-2xl">Send</h3>
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