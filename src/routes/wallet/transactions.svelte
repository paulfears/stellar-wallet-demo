
<script lang='ts'>
	import { isTestnet, dataPacket } from '$lib/wallet-store';
    import { Card } from 'flowbite-svelte';
    let StellarExpertNetwork = $isTestnet?'testnet':'public';
    let address = $dataPacket.currentAddress;
    let stellarExpertLink = `https://stellar.expert/explorer/${StellarExpertNetwork}/account/${address}`;

    let StellarChainNetwork = $isTestnet?'testnet.':'';
    let StellarChainLink = `https://${StellarChainNetwork}stellarchain.io/accounts/${address}`;
</script>

<Card>
<a href={stellarExpertLink} target='_blank'>open Stellar Expert   🡥</a>
</Card>
<Card>
<a href={StellarChainLink} target='_blank'>open StellarChain.io    🡥</a>
</Card>