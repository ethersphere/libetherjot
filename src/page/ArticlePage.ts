import { Bee } from '@ethersphere/bee-js'
import { Strings } from 'cafe-utility'
import { ParsedMarkdown } from '../engine/FrontMatter'
import { Article, GlobalState } from '../engine/GlobalState'
import { preprocess } from '../engine/Preprocessor'
import { createArticleSlug } from '../engine/Utility'
import { createDonationButton } from '../html/Donation'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createLinkSvg } from '../html/LinkSvg'
import { createLinkedinSvg } from '../html/LinkedinSvg'
import { createRelatedArticles } from '../html/RelatedArticles'
import { createStyleSheet } from '../html/StyleSheet'
import { createTagCloud } from '../html/TagCloud'
import { createTwitterSvg } from '../html/TwitterSvg'

export async function createArticlePage(
    bee: Bee,
    title: string,
    markdown: ParsedMarkdown,
    globalState: GlobalState,
    tagsAndCategories: string[],
    banner: string,
    date: string,
    parseFn: (markdown: string) => string
): Promise<Article> {
    const processedArticle = await preprocess(parseFn(markdown.body))
    const sidebarPublishedHtml = tagsAndCategories.length
        ? `<div class="article-sidebar-block"><h3>Published in:</h3>${createTagCloud(tagsAndCategories, 1)}</div>`
        : ``
    const relatedArticlesHtml = createRelatedArticles(globalState, title, tagsAndCategories[0] || '')
    const readMoreHtml = relatedArticlesHtml
        ? `<div class="content-area"><h2 class="read-more">Read more...</h2>${relatedArticlesHtml}</div>`
        : ``
    const head = `<title>${title} | ${globalState.configuration.title}</title>${createStyleSheet(1)}`
    const body = `
    ${await createHeader(globalState, 1, 'Latest', 'p')}
    <main>
        <article>
            <div class="content-area grid-container">
                <div class="grid-3">
                    <p class="article-date">${date}</p>
                </div>
                <div class="grid-6">
                    ${createTagCloud(tagsAndCategories, 1)}
                    <h1>${title}</h1>
                </div>
            </div>
            <div class="content-area onpage-banner">
                <img src="${banner}" class="banner" />
            </div>
            <div class="content-area grid-container">
                <aside class="grid-3">
                    <div class="article-sidebar">
                        <div class="article-sidebar-block">
                            <h3>Jump to:</h3>
                            <div class="table-of-contents">
                                ${processedArticle.tableOfContents
                                    .map(x => `<a href="#${x}">${Strings.camelToTitle(Strings.slugToCamel(x))}</a>`)
                                    .join('')}
                            </div>
                        </div>
                        ${sidebarPublishedHtml}
                        <div class="article-sidebar-block">
                            <h3>Share to:</h3>
                            <span id="share-link" class="pointer">${createLinkSvg()}</span>
                            <span id="share-twitter" class="pointer">${createTwitterSvg()}</span>
                            <span id="share-linkedin" class="pointer">${createLinkedinSvg()}</span>
                        </div>
                    </div>
                </aside>
                <div class="grid-6">
                    ${processedArticle.html}
                </div>
                ${globalState.configuration.allowDonations ? createDonationButton(globalState) : ''}
            </div>
        </article>
        ${readMoreHtml}
    </main>
    ${await createFooter(globalState, 1)}
    <script>
        const shareLink = document.getElementById('share-link')
        const shareTwitter = document.getElementById('share-twitter')
        const shareLinkedin = document.getElementById('share-linkedin')
        const url = window.location.href
        shareLink.addEventListener('click', () => {
            navigator.clipboard.writeText(url)
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1000
              })
              Toast.fire({
                icon: 'success',
                title: 'Copied to clipboard'
              })
        })
        shareTwitter.addEventListener('click', () => {
            window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(url))
        })
        shareLinkedin.addEventListener('click', () => {
            window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url))
        })
    </script>`
    const html = await createHtml5(head, body)
    const markdownResults = await bee.uploadFile(globalState.stamp, markdown.raw, 'index.md', {
        contentType: 'text/markdown',
        deferred: true
    })
    const htmlResults = await bee.uploadData(globalState.stamp, html, { deferred: true })
    const path = `post/${createArticleSlug(title)}`
    return {
        title,
        banner,
        preview: markdown.raw.slice(0, 150),
        kind: 'regular',
        categories: [],
        tags: tagsAndCategories,
        markdown: markdownResults.reference,
        html: htmlResults.reference,
        path,
        createdAt: Date.now()
    }
}
