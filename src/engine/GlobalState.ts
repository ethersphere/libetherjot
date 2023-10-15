import { Bee, BeeDebug } from '@ethersphere/bee-js'
import { Arrays, Objects, Types } from 'cafe-utility'
import { Wallet, ethers } from 'ethers'
import { MantarayNode } from 'mantaray-js'
import { createDefaultImage } from '../html/DefaultImage'
import { createFavicon } from '../html/Favicon'
import { createArticleFontData, createBrandingFontData, createNormalFontData } from '../html/Font'
import { createStyle } from '../html/Style'
import { createFrontPage } from '../page/FrontPage'

interface Asset {
    name: string
    contentType: string
    reference: string
}

interface FontCollection {
    menu: string
    branding: string
    article: string
}

interface Configuration {
    title: string
    header: {
        title: string
        description: string
        link: string
    }
    main: {
        highlight: string
    }
    footer: {
        description: string
        links: {
            discord: string
            twitter: string
            github: string
            youtube: string
            reddit: string
        }
    }
    allowDonations: boolean
}

interface Page {
    title: string
    markdown: string
    html: string
    path: string
}

export interface Article {
    title: string
    preview: string
    markdown: string
    html: string
    categories: string[]
    tags: string[]
    createdAt: number
    path: string
    banner: string
    kind: 'h1' | 'h2' | 'highlight' | 'regular'
}

export interface GlobalStateOnDisk {
    privateKey: string
    configuration: Configuration
    feed: string
    styleReference: string
    font: FontCollection
    defaultCoverImage: string
    favicon: string
    pages: Page[]
    articles: Article[]
    images: Record<string, string>
    collections: Record<string, string>
    assets: Asset[]
}

export interface GlobalState {
    wallet: Wallet
    stamp: string
    configuration: Configuration
    feed: string
    styleReference: string
    font: FontCollection
    defaultCoverImage: string
    favicon: string
    pages: Page[]
    articles: Article[]
    images: Record<string, string>
    collections: Record<string, string>
    mantaray: MantarayNode
    assets: Asset[]
}

export async function getGlobalState(beeDebug: BeeDebug, json: Record<string, any>): Promise<GlobalState> {
    const configuration = Types.asObject(json.configuration)
    const globalStateOnDisk: GlobalStateOnDisk = {
        privateKey: Types.asString(json.privateKey),
        configuration: {
            title: Types.asString(configuration.title),
            header: {
                title: Types.asEmptiableString(Objects.getDeep(configuration, 'header.title')),
                description: Types.asEmptiableString(Objects.getDeep(configuration, 'header.description')),
                link: Types.asEmptiableString(Objects.getDeep(configuration, 'header.link'))
            },
            main: {
                highlight: Types.asEmptiableString(Objects.getDeep(configuration, 'main.highlight'))
            },
            footer: {
                description: Types.asEmptiableString(Objects.getDeep(configuration, 'footer.description')),
                links: {
                    discord: Types.asEmptiableString(Objects.getDeep(configuration, 'footer.links.discord')),
                    twitter: Types.asEmptiableString(Objects.getDeep(configuration, 'footer.links.twitter')),
                    github: Types.asEmptiableString(Objects.getDeep(configuration, 'footer.links.github')),
                    youtube: Types.asEmptiableString(Objects.getDeep(configuration, 'footer.links.youtube')),
                    reddit: Types.asEmptiableString(Objects.getDeep(configuration, 'footer.links.reddit'))
                }
            },
            allowDonations: Types.asBoolean(Objects.getDeep(configuration, 'allowDonations'))
        },
        feed: Types.asString(json.feed),
        styleReference: Types.asString(json.styleReference),
        font: {
            menu: Types.asString(Types.asObject(json.font).menu),
            branding: Types.asString(Types.asObject(json.font).branding),
            article: Types.asString(Types.asObject(json.font).article)
        },
        defaultCoverImage: Types.asString(json.defaultCoverImage),
        favicon: Types.asString(json.favicon),
        pages: Types.asArray(json.pages).map((x: any) => ({
            title: Types.asString(x.title),
            markdown: Types.asString(x.markdown),
            html: Types.asString(x.html),
            path: Types.asString(x.path)
        })),
        articles: Types.asArray(json.articles).map((x: any) => {
            return {
                title: Types.asString(x.title),
                preview: Types.asString(x.preview),
                markdown: Types.asString(x.markdown),
                html: Types.asString(x.html),
                categories: Types.asArray(x.categories || []).map(Types.asString),
                tags: Types.asArray(x.tags || []).map(Types.asString),
                createdAt: Types.asNumber(x.createdAt),
                path: Types.asString(x.path),
                banner: x.banner || null,
                kind: Types.asString(x.kind) as any
            }
        }),
        images: Types.asObject(json.images) as Record<string, string>,
        collections: Types.asObject(json.collections || {}) as Record<string, string>,
        assets: Types.asArray(json.assets || []).map((x: any) => ({
            name: Types.asString(x.name),
            contentType: Types.asString(x.contentType),
            reference: Types.asString(x.reference)
        }))
    }
    return createGlobalState(beeDebug, globalStateOnDisk)
}

export async function saveGlobalState(globalState: GlobalState): Promise<GlobalStateOnDisk> {
    const globalStateOnDisk: GlobalStateOnDisk = {
        privateKey: globalState.wallet.privateKey,
        configuration: globalState.configuration,
        feed: globalState.feed,
        styleReference: globalState.styleReference,
        font: globalState.font,
        defaultCoverImage: globalState.defaultCoverImage,
        favicon: globalState.favicon,
        pages: globalState.pages,
        articles: globalState.articles,
        images: globalState.images,
        collections: globalState.collections,
        assets: globalState.assets
    }
    return globalStateOnDisk
}

export async function createDefaultGlobalState(
    bee: Bee,
    beeDebug: BeeDebug,
    websiteName: string
): Promise<GlobalStateOnDisk> {
    const wallet = ethers.Wallet.createRandom()
    const stamp = await getStamp(beeDebug)
    const feedReference = await bee.createFeedManifest(stamp, 'sequence', '0'.repeat(64), wallet.address)
    const fontNormalResults = await bee.uploadData(stamp, createNormalFontData(), { deferred: true })
    const fontBrandingResults = await bee.uploadData(stamp, createBrandingFontData(), { deferred: true })
    const fontArticleResults = await bee.uploadData(stamp, createArticleFontData(), { deferred: true })
    const styleResults = await bee.uploadData(stamp, createStyle(), { deferred: true })
    const defaultCoverImageResults = await bee.uploadData(stamp, createDefaultImage(), { deferred: true })
    const faviconResults = await bee.uploadData(stamp, createFavicon(), { deferred: true })
    const globalStateOnDisk: GlobalStateOnDisk = {
        privateKey: wallet.privateKey,
        pages: [],
        articles: [],
        images: {},
        feed: feedReference.reference,
        styleReference: styleResults.reference,
        font: {
            menu: fontNormalResults.reference,
            branding: fontBrandingResults.reference,
            article: fontArticleResults.reference
        },
        defaultCoverImage: defaultCoverImageResults.reference,
        favicon: faviconResults.reference,
        configuration: {
            title: websiteName,
            header: {
                title: '',
                description: '',
                link: ''
            },
            main: {
                highlight: ''
            },
            footer: {
                description: '',
                links: {
                    discord: '',
                    twitter: '',
                    github: '',
                    youtube: '',
                    reddit: ''
                }
            },
            allowDonations: false
        },
        collections: {},
        assets: []
    }
    await createFrontPage(bee, await createGlobalState(beeDebug, globalStateOnDisk))
    return globalStateOnDisk
}

async function createGlobalState(beeDebug: BeeDebug, globalStateOnDisk: GlobalStateOnDisk): Promise<GlobalState> {
    const stamp = await getStamp(beeDebug)
    const globalState: GlobalState = {
        wallet: new ethers.Wallet(
            globalStateOnDisk.privateKey.startsWith('0x')
                ? globalStateOnDisk.privateKey.slice(2)
                : globalStateOnDisk.privateKey
        ),
        configuration: globalStateOnDisk.configuration,
        feed: globalStateOnDisk.feed,
        styleReference: globalStateOnDisk.styleReference,
        font: globalStateOnDisk.font,
        defaultCoverImage: globalStateOnDisk.defaultCoverImage,
        favicon: globalStateOnDisk.favicon,
        stamp,
        pages: globalStateOnDisk.pages,
        articles: globalStateOnDisk.articles,
        images: globalStateOnDisk.images,
        collections: globalStateOnDisk.collections,
        mantaray: new MantarayNode(),
        assets: globalStateOnDisk.assets
    }
    return globalState
}

async function getStamp(beeDebug: BeeDebug): Promise<string> {
    const stamps = await beeDebug.getAllPostageBatch()
    if (stamps.length === 0) {
        throw new Error('No stamps available. Please create a stamp using Bee Debug API.')
    }
    return Arrays.pick(stamps).batchID
}
