<script>

import Editor from "$lib/components/MetaStellarEditor/MetaStellarEditor.svelte";
import {Heading, P} from 'flowbite-svelte';

let getAddress = `
    let address = callMetaStellar('getAddress');
    address.then(alert);
    
`


let getDataPacket = `
    callMetaStellar('getDataPacket').then((result)=>alert(JSON.stringify(result)));
`
/*
case 'setCurrentAccount':
    params.address
*/
let showAddress = `callMetaStellar('showAddress');`


let createAccount = `callMetaStellar('createAccount', {name: 'new-account-name'});`


let listAccounts =  `callMetaStellar('listAccounts').then((result)=>alert(JSON.stringify(result)));`

let renameAccount = `callMetaStellar('renameAccount', {address: 'address', name: 'new-name'}).then((result)=>alert(JSON.stringify(result)));`


let importAccount = `callMetaStellar('importAccount');`


let fund = `callMetaStellar('fund').then((result)=>alert(JSON.stringify(result)));`

let getFederationName = `callMetaStellar('getWalletName').then((result)=>alert(JSON.stringify(result)));`


let lookUpFedAccountByAddress = `
callMetaStellar('lookUpFedAccountByAddress', 
    {address: 'GB2O6R5JUJGJNXN6MD3TNBL4XJU2PFCK7YTWZJXYOR6OBEE2E46MIYEM'}
)
.then((result)=>alert(JSON.stringify(result)));`

let lookUpFedAccountByName = `callMetaStellar('lookUpFedAccountByName', {url: 'gloosy*metastellar.io'}).then((result)=>alert(JSON.stringify(result)));`

let getBalance = `callMetaStellar('getBalance', {testnet:true}).then(alert);`

let getAssets = `callMetaStellar('getAssets').then((result)=>alert(JSON.stringify(result)));`




let dispPrivateKey = `callMetaStellar('dispPrivateKey');`

// -------------------------------- Methods That Require a funded Account ------------------------------------------
let getAccountInfo = `callMetaStellar('getAccountInfo', {testnet:true}).then((result)=>alert(JSON.stringify(result)));`

let transfer = `callMetaStellar('transfer', {
    to: 'GB2O6R5JUJGJNXN6MD3TNBL4XJU2PFCK7YTWZJXYOR6OBEE2E46MIYEM', 
    amount: '100', 
    testnet:true
    }
)
.then((result)=>alert(JSON.stringify(result)));`

/*
case 'signTransaction':
    params.transaction

case 'signAndSubmitTransaction':
    params.transaction
*/
let createFederationAccount = `callMetaStellar('createFederationAccount').then((result)=>alert(JSON.stringify(result)));`

let openSendXLM = `callMetaStellar('openSendXLM');`;


</script>

<div class='simple-card'>
    <h1>GetAddress</h1>
    <h2>callMetaStellar('getAddress')</h2>
    <Editor code={getAddress}/>
</div>

<div class='simple-card'>
    <h1>getDataPacket</h1>
    <h2>callMetaStellar('getDataPacket')</h2>
    <Editor code={getDataPacket}/>
</div>

<div class='simple-card'>
    <h1>showAddress</h1>
    <h2>callMetaStellar('showAddress')</h2>
    <Editor code={showAddress}/>
</div>

<div class='simple-card'>
    <h1>createAccount</h1>
    <h2>{`callMetaStellar('createAccount', {'name':'new-account-name'})`}</h2>
    <Editor code={createAccount}/>
</div>

<div class='simple-card'>
    <h1>listAccounts</h1>
    <h2>{`callMetaStellar('listAccounts')`}</h2>
    <Editor code={listAccounts}/>
</div>

<div class='simple-card'>
    <h1>renameAccount</h1>
    <h2>{`callMetaStellar('renameAccount', {address:'account-address', name:'new-name'})`}</h2>
    <Editor code={renameAccount}/>
</div>

<div class='simple-card'>
    <h1>importAccount</h1>
    <h2>{`callMetaStellar('importAccount')`}</h2>
    <Editor code={importAccount}/>
</div>

<div class='simple-card'>
    <h1>fund</h1>
    <h2>{`callMetaStellar('fund')`}</h2>
    <Editor code={fund}/>
</div>

<div class='simple-card'>
    <h1>getFederationName</h1>
    <h2>{`callMetaStellar('getFederationName')`}</h2>
    <Editor code={getFederationName}>Gets the federation name of the current account returns null if there is none</Editor>
</div>

<div class='simple-card'>
    <h1>lookUpFedAccountByAddress</h1>
    <h2>{`callMetaStellar("lookUpFedAccountByAddress", {"address":'metastellarAddress');`}</h2>
    <Editor code={lookUpFedAccountByAddress}/>
</div>

<div class='simple-card'>
    <h1>lookUpFedAccountByName</h1>
    <h2>{`callMetaStellar("lookUpFedAccountByName", {"url":'gloosy*metastellar.io');`}</h2>
    <Editor code={lookUpFedAccountByName}/>
</div>

<div class='simple-card'>
    <h1>getBalance</h1>
    <h2>{`callMetaStellar('getBalance', {testnet:true})`}</h2>
    <Editor code={getBalance}/>
</div>

<div class='simple-card'>
    <h1>getAssets</h1>
    <h2>{`callMetaStellar('getAssets')`}</h2>
    <Editor code={getAssets}/>
</div>

<div class='simple-card'>
    <h1>dispPrivateKey</h1>
    <h2>{`callMetaStellar('dispPrivateKey')`}</h2>
    <Editor code={dispPrivateKey}/>
</div>

<div class='simple-card'>
    <h1>getAccountInfo</h1>
    <h2>{`callMetaStellar('getAccountInfo', {testnet:true})`}</h2>
    <Editor code={getAccountInfo}/>
</div>

<div class='simple-card'>
    <h1>transfer</h1>
    <h2>{`callMetaStellar('transfer', {to:'GB2O6R5JUJGJNXN6MD3TNBL4XJU2PFCK7YTWZJXYOR6OBEE2E46MIYEM', amount:'100', testnet:true})`}</h2>
    <Editor code={transfer}/>
</div>

<div class='simple-card'>
    <h1>createFederationAccount</h1>
    <h2>{`callMetaStellar('createFederationAccount')`}</h2>
    <Editor code={createFederationAccount}/>
</div>

<div class='simple-card'>
    <h1>openSendXLM</h1>
    <h2>{`callMetaStellar('openSendXLM')`}</h2>
    <Editor code={openSendXLM}/>
</div>

<style>
h1{
    text-align: left;
    font-size:150%;
    margin-top:1em;
}
h2{
    margin-bottom: 10px;
}


</style>