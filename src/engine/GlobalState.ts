import { Objects, Types } from 'cafe-utility'
import { Wallet, ethers } from 'ethers'
import { Swarm } from 'libswarm'
import { createFrontPage } from '../page/FrontPage'

export interface Asset {
    name: string
    contentType: string
    reference: string
}

interface Configuration {
    title: string
    header: {
        title: string
        logo: string
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
    category: string
    tags: string[]
    createdAt: number
    path: string
    banner: string
    kind: 'h1' | 'h2' | 'highlight' | 'regular'
    stamp: string
}

export interface GlobalStateOnDisk {
    privateKey: string
    configuration: Configuration
    feed: string
    pages: Page[]
    articles: Article[]
    collections: Record<string, string>
    assets: Asset[]
}

export interface GlobalState {
    swarm: Swarm
    wallet: Wallet
    configuration: Configuration
    feed: string
    pages: Page[]
    articles: Article[]
    collections: Record<string, string>
    assets: Asset[]
}

export async function getGlobalState(json: Record<string, any>): Promise<GlobalState> {
    const configuration = Types.asObject(json.configuration)
    const globalStateOnDisk: GlobalStateOnDisk = {
        privateKey: Types.asString(json.privateKey),
        configuration: {
            title: Types.asString(configuration.title),
            header: {
                title: Types.asEmptiableString(Objects.getDeep(configuration, 'header.title')),
                logo: Types.asEmptiableString(Objects.getDeep(configuration, 'header.logo')),
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
                category: Types.asString(x.category),
                tags: Types.asArray(x.tags || []).map(Types.asString),
                createdAt: Types.asNumber(x.createdAt),
                path: Types.asString(x.path),
                banner: x.banner || null,
                kind: Types.asString(x.kind) as any,
                stamp: Types.asString(x.stamp)
            }
        }),
        collections: Types.asObject(json.collections || {}) as Record<string, string>,
        assets: Types.asArray(json.assets || []).map((x: any) => ({
            name: Types.asString(x.name),
            contentType: Types.asString(x.contentType),
            reference: Types.asString(x.reference)
        }))
    }
    return createGlobalState(globalStateOnDisk)
}

export async function saveGlobalState(globalState: GlobalState): Promise<GlobalStateOnDisk> {
    const globalStateOnDisk: GlobalStateOnDisk = {
        privateKey: globalState.wallet.privateKey,
        configuration: globalState.configuration,
        feed: globalState.feed,
        pages: globalState.pages,
        articles: globalState.articles,
        collections: globalState.collections,
        assets: globalState.assets
    }
    return globalStateOnDisk
}

export async function createDefaultGlobalState(websiteName: string): Promise<GlobalStateOnDisk> {
    const swarm = new Swarm()
    const wallet = ethers.Wallet.createRandom()
    const feed = await swarm.newWebsite(websiteName, swarm.newCollection()).generateAddress()
    const globalStateOnDisk: GlobalStateOnDisk = {
        privateKey: wallet.privateKey,
        pages: [],
        articles: [],
        feed,
        configuration: {
            title: websiteName,
            header: {
                title: '',
                logo: '',
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
    await createFrontPage(await createGlobalState(globalStateOnDisk))
    return globalStateOnDisk
}

async function createGlobalState(globalStateOnDisk: GlobalStateOnDisk): Promise<GlobalState> {
    const globalState: GlobalState = {
        swarm: new Swarm(),
        wallet: new ethers.Wallet(
            globalStateOnDisk.privateKey.startsWith('0x')
                ? globalStateOnDisk.privateKey.slice(2)
                : globalStateOnDisk.privateKey
        ),
        configuration: globalStateOnDisk.configuration,
        feed: globalStateOnDisk.feed,
        pages: globalStateOnDisk.pages,
        articles: globalStateOnDisk.articles,
        collections: globalStateOnDisk.collections,
        assets: globalStateOnDisk.assets
    }
    return globalState
}
