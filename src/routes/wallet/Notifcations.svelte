<script lang='ts'>
	
	
	import { Modal } from 'flowbite-svelte';
    import { dataPacket, claimableBalances } from '$lib/wallet-store';
    import { onMount } from 'svelte';

    import GetClaimable from './claimableBalance/getClaimable.svelte';

    export let notifications:any = [];

    export let opened = false;

    
    $: console.log(notifications)
</script>

<Modal bind:open={opened} on:close={() => opened = false}>
    <div>
        <h2 class="uk-modal-title">Notifications</h2>
        <ul>
            {#each notifications as notification}
                {#if notification.type === "claimableBalance"}
                    <GetClaimable claimableBalance={notification.data}/>
                {/if}
            {/each}
        </ul>
    </div>

</Modal>