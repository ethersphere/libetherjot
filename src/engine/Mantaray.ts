import { Strings } from 'cafe-utility'
import { createDefaultImage } from '../html/DefaultImage'
import { createFavicon } from '../html/Favicon'
import { createArticleFontData, createBrandingFontData, createNormalFontData } from '../html/Font'
import { createStyle } from '../html/Style'
import { createFrontPage } from '../page/FrontPage'
import { GlobalState } from './GlobalState'
import { createArticleSlug } from './Utility'

export async function recreateMantaray(globalState: GlobalState): Promise<void> {
    const collection = globalState.swarm.newCollection()
    await collection.addRawData(
        'font-variant-2.woff2',
        globalState.swarm.newRawData(createNormalFontData(), 'font/woff2')
    )
    await collection.addRawData(
        'font-variant-1.ttf',
        globalState.swarm.newRawData(createBrandingFontData(), 'font/ttf')
    )
    await collection.addRawData('font-variant-3.ttf', globalState.swarm.newRawData(createArticleFontData(), 'font/ttf'))
    await collection.addRawData('style.css', globalState.swarm.newRawData(createStyle(), 'text/css'))
    await collection.addRawData('default.png', globalState.swarm.newRawData(createDefaultImage(), 'image/png'))
    await collection.addRawData('favicon.png', globalState.swarm.newRawData(createFavicon(), 'image/png'))
    await collection.addRawData('/', await createFrontPage(globalState))
    await collection.addRawData('index.html', await createFrontPage(globalState))
    for (const page of globalState.pages) {
        await collection.addHandle(page.path, globalState.swarm.newHandle(page.path, page.html, 'text/html'))
    }
    for (const article of globalState.articles) {
        await collection.addHandle(article.path, globalState.swarm.newHandle(article.path, article.html, 'text/html'))
    }
    for (const collectionPage of Object.keys(globalState.collections)) {
        await collection.addHandle(
            createArticleSlug(collectionPage),
            globalState.swarm.newHandle(collectionPage, globalState.collections[collectionPage], 'text/html')
        )
    }
    for (const [src, reference] of Object.entries(globalState.images)) {
        await collection.addHandle(src, globalState.swarm.newHandle(src, reference, 'image/png'))
        await collection.addHandle(
            Strings.joinUrl('post', src),
            globalState.swarm.newHandle(src, reference, 'image/png')
        )
    }
    await collection.save()
    await globalState.swarm.newWebsite(globalState.configuration.title, collection).publish()
}
