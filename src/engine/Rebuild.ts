import { createArticlePage } from '../page/ArticlePage'
import { createMenuPage } from '../page/MenuPage'
import { parseMarkdown } from './FrontMatter'
import { GlobalState } from './GlobalState'

export async function rebuildMenuPages(globalState: GlobalState, parseFn: (markdown: string) => string): Promise<void> {
    for (const page of globalState.pages) {
        const rawData = await globalState.swarm.downloadRawData(page.markdown, 'text/markdown')
        const results = await createMenuPage(page.title, rawData.utf8, globalState, parseFn)
        page.html = results.swarmReference
    }
}

export async function rebuildArticlePages(
    globalState: GlobalState,
    parseFn: (markdown: string) => string
): Promise<void> {
    for (const article of globalState.articles) {
        const rawData = await globalState.swarm.downloadRawData(article.markdown, 'text/markdown')
        const results = await createArticlePage(
            article.title,
            parseMarkdown(rawData.utf8),
            globalState,
            [...article.tags, ...article.categories],
            article.banner,
            new Date(article.createdAt).toDateString(),
            parseFn
        )
        article.html = results.html
    }
}