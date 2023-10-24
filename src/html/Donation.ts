import { GlobalState } from '../engine/GlobalState'

export async function createDonationButton(globalState: GlobalState, stamp: string) {
    return `
    <button id="tip">Give a tip directly</button>
    <button id="top-up">Top up postage stamp</button>
    <script>
        document.querySelector('#tip').addEventListener('click', async () => {
            ethereum.request({ method: 'eth_requestAccounts' }).then(async accounts => {
                const account = accounts[0];
                const params = {
                    to: '${await globalState.swarm.getNodeAddress()}',
                    from: account,
                    value: '0x38d7ea4c68000'
                }
                const tx = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [params]
                })
            })
        })
        document.querySelector('#top-up').addEventListener('click', async () => {
            new BeeJs.BeeDebug('http://localhost:1635').topUpBatch('${stamp}', '1100100100')
        })
    </script>
    `
}
