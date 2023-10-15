import { Bee } from '@ethersphere/bee-js'
import { createArticlePage } from '../page/ArticlePage'
import { createMenuPage } from '../page/MenuPage'
import { parseMarkdown } from './FrontMatter'
import { GlobalState } from './GlobalState'

export async function rebuildMenuPages(
    bee: Bee,
    globalState: GlobalState,
    parseFn: (markdown: string) => string
): Promise<void> {
    for (const page of globalState.pages) {
        const rawData = await bee.downloadFile(page.markdown)
        const results = await createMenuPage(bee, page.title, rawData.data.text(), globalState, parseFn)
        page.html = results.swarmReference
    }
}

export async function rebuildArticlePages(
    bee: Bee,
    globalState: GlobalState,
    parseFn: (markdown: string) => string
): Promise<void> {
    for (const article of globalState.articles) {
        const rawData = await bee.downloadFile(article.markdown)
        const results = await createArticlePage(
            bee,
            article.title,
            parseMarkdown(rawData.data.text()),
            globalState,
            [...article.tags, ...article.categories],
            article.banner,
            new Date(article.createdAt).toDateString(),
            parseFn
        )
        article.html = results.html
    }
}
