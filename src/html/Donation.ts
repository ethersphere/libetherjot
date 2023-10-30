import { GlobalState } from '../engine/GlobalState'

export async function createDonationButton(globalState: GlobalState, stamp: string) {
    return `
    <div id="donation"></div>
    <script src="https://cdn.jsdelivr.net/npm/swarm-donation@1.1.0"></script>
    <script>
        renderSwarmDonation('donation', '${stamp}', '0000000000000000000000000000000000000000000000000000000000000000')
    </script>
    `
}
