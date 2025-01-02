<script lang='ts'>
import { dataPacket, isTestnet, type walletAsset } from '$lib/wallet-store.ts';
    
import { ChevronDownOutline } from 'flowbite-svelte-icons';
import { Button, Dropdown, DropdownItem, DropdownDivider, P, Input } from 'flowbite-svelte';

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
</div>