// import { Account, ConnectAdditionalRequest, TonProofItemReplySuccess } from "@tonconnect/ui-react";

// class TonProofDemoApiService {
//     private localStorageKey = 'demo-api-access-token';

//     private host = document.baseURI.replace(/\/$/, '');

//     public accessToken: string | null = null;

//     public readonly refreshIntervalMs = 9 * 60 * 1000;

//     constructor() {
//         this.accessToken = localStorage.getItem(this.localStorageKey);

//         if (!this.accessToken) {
//             this.generatePayload();
//         }
//     }

//     async generatePayload(): Promise<ConnectAdditionalRequest | null> {
//         try {
//             const response = await (
//                 await fetch(`${this.host}/api/generate_payload`, {
//                     method: 'POST',
//                 })
//             ).json();
//             return { tonProof: response.payload as string };
//         } catch {
//             return null;
//         }
//     }

//     async checkProof(proof: TonProofItemReplySuccess['proof'], account: Account): Promise<void> {
//         try {
//             const reqBody = {
//                 address: account.address,
//                 network: account.chain,
//                 public_key: account.publicKey,
//                 proof: {
//                     ...proof,
//                     state_init: account.walletStateInit,
//                 },
//             };

//             const response = await (
//                 await fetch(`${this.host}/api/check_proof`, {
//                     method: 'POST',
//                     body: JSON.stringify(reqBody),
//                 })
//             ).json();

//             if (response?.token) {
//                 localStorage.setItem(this.localStorageKey, response.token);
//                 this.accessToken = response.token;
//             }
//         } catch (e) {
//             console.log('checkProof error:', e);
//         }
//     }
// }