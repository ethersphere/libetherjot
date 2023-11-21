export async function createDonationButton(stamp: string) {
    return `
    <div id="donation"></div>
    <script src="https://cdn.jsdelivr.net/npm/swarm-donation@1.1.0"></script>
    <script>
        renderSwarmDonation('donation', '0x5D06DbA329cD33cb87C695e13A23Ae1e9539BB11', '${stamp}')
    </script>
    `
}
