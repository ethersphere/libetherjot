import { Bee } from '@ethersphere/bee-js'
import { GlobalState } from '../engine/GlobalState'
import { preprocess } from '../engine/Preprocessor'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createStyleSheet } from '../html/StyleSheet'

export async function createMenuPage(
    bee: Bee,
    title: string,
    markdown: string,
    globalState: GlobalState,
    parseFn: (markdown: string) => string
): Promise<{
    markdownReference: string
    swarmReference: string
}> {
    const head = `<title>${title} | ${globalState.configuration.title}</title>${createStyleSheet(0)}`
    const body = `${await createHeader(globalState, 0, 'Latest')}<main>${await preprocess(
        parseFn(markdown)
    )}</main>${await createFooter(globalState, 0)}`
    const html = await createHtml5(head, body)
    const markdownResults = await bee.uploadFile(globalState.stamp, markdown, 'index.md', {
        contentType: 'text/markdown',
        deferred: true
    })
    const htmlResults = await bee.uploadData(globalState.stamp, html)
    return {
        markdownReference: markdownResults.reference,
        swarmReference: htmlResults.reference
    }
}
