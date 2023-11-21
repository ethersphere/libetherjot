export async function createCommentSystem(commentsFeed: string) {
    return `
    <div id="comments"></div>
    <script src="https://cdn.jsdelivr.net/npm/swarm-comment-system-ui@1.0.0"></script>
    <script>
        window.SwarmCommentSystem.renderSwarmComments('comments', { approvedFeedAddress: "${commentsFeed}" })
    </script>
    `
}
