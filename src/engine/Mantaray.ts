import { Bee } from '@ethersphere/bee-js'
import { Strings } from 'cafe-utility'
import { MantarayNode, Reference } from 'mantaray-js'
import { createFrontPage } from '../page/FrontPage'
import { GlobalState } from './GlobalState'
import { createArticleSlug } from './Utility'

export async function recreateMantaray(bee: Bee, globalState: GlobalState): Promise<void> {
    const node = globalState.mantaray
    const frontPage = await createFrontPage(bee, globalState)
    addToMantaray(node, '/', frontPage.swarmReference)
    addToMantaray(node, 'index.html', frontPage.swarmReference)
    addToMantaray(node, 'style.css', globalState.styleReference)
    addToMantaray(node, 'font-variant-1.ttf', globalState.font.branding)
    addToMantaray(node, 'font-variant-2.woff2', globalState.font.menu)
    addToMantaray(node, 'font-variant-3.ttf', globalState.font.article)
    addToMantaray(node, 'post/font-variant-1.ttf', globalState.font.branding)
    addToMantaray(node, 'post/font-variant-2.woff2', globalState.font.menu)
    addToMantaray(node, 'post/font-variant-3.ttf', globalState.font.article)
    addToMantaray(node, 'default.png', globalState.defaultCoverImage)
    addToMantaray(node, 'favicon.png', globalState.favicon)
    addToMantaray(node, 'post/favicon.png', globalState.favicon)
    addToMantaray(node, 'post/default.png', globalState.defaultCoverImage)
    for (const page of globalState.pages) {
        addToMantaray(node, page.path, page.html)
    }
    for (const article of globalState.articles) {
        addToMantaray(node, article.path, article.html)
    }
    for (const collection of Object.keys(globalState.collections)) {
        addToMantaray(node, createArticleSlug(collection), globalState.collections[collection])
    }
    for (const [src, reference] of Object.entries(globalState.images)) {
        addToMantaray(node, src, reference)
        addToMantaray(node, Strings.joinUrl('post', src), reference)
    }
    await uploadMantaray(bee, globalState)
}

async function uploadMantaray(bee: Bee, globalState: GlobalState): Promise<void> {
    const reference = await globalState.mantaray.save(async (data: Uint8Array) => {
        const { reference } = await bee.uploadData(globalState.stamp, data, { deferred: true })
        return Strings.hexToUint8Array(reference) as Reference
    })
    console.log('Mantaray reference:', Strings.uint8ArrayToHex(reference))
    const writer = bee.makeFeedWriter('sequence', '0'.repeat(64), globalState.wallet.privateKey)
    await writer.upload(globalState.stamp, reference as any, { deferred: true })
    return
}

function addToMantaray(node: MantarayNode, key: string, value: string): void {
    node.addFork(encodePath(key), Strings.hexToUint8Array(value) as Reference, {
        'Content-Type': determineContentType(key),
        Filename: Strings.normalizeFilename(key),
        'website-index-document': 'index.html',
        'website-error-document': 'index.html'
    })
}

function encodePath(path: string): Uint8Array {
    return new TextEncoder().encode(path)
}

function determineContentType(path: string): string {
    if (path.endsWith('.css')) {
        return 'text/css'
    }
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        return 'image/jpeg'
    }
    if (path.endsWith('.png')) {
        return 'image/png'
    }
    if (path.endsWith('.svg')) {
        return 'image/svg+xml'
    }
    if (path.endsWith('.webp')) {
        return 'image/webp'
    }
    return 'text/html'
}
