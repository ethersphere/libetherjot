import { Strings } from 'cafe-utility'
import { articleFontData } from '../data/ArticleFont'
import { brandingFontData } from '../data/BrandingFont'
import { menuFontData } from '../data/MenuFont'

export function createNormalFontData() {
    return Strings.base64ToUint8Array(menuFontData)
}

export function createBrandingFontData() {
    return Strings.base64ToUint8Array(brandingFontData)
}

export function createArticleFontData() {
    return Strings.base64ToUint8Array(articleFontData)
}
