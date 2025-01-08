import * as StellarSDK from '@stellar/stellar-sdk';
export interface txnData {
    hash:string,
    operations?:StellarSDK.Horizon.ServerApi.OperationRecord[],
    effects?:StellarSDK.Horizon.ServerApi.EffectRecord[],
    transactionData?:StellarSDK.Horizon.ServerApi.TransactionRecord,
    isSigner?:boolean;
}


export interface accountStructure{
    [accountAddress:string]:{
        mainnet:{
            txns:txnData[],
            txnCursor?:string;
        }
        testnet:{
            txns:txnData[],
            txnCursor?:string
        }
    }
}