import { GlobalState } from '../engine/GlobalState'

export function createDonationButton(globalState: GlobalState) {
    return `
    <button id="tip">Give a tip directly</button>
    <button id="top-up">Top up postage stamp</button>
    <script>
        document.querySelector('#tip').addEventListener('click', async () => {
            ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
                const account = accounts[0];
                const params = {
                    to: '${globalState.stamp}',
                    from: account,
                    value: 0x38d7ea4c68000
                }
                const tx = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [params]
                })
            })
        })
    </script>
    `
}
