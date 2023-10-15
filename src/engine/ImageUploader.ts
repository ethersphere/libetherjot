import { Bee } from '@ethersphere/bee-js'
import { GlobalState } from './GlobalState'

interface UploadedFile {
    reference: string
    path: string
}

export async function uploadImage(
    bee: Bee,
    globalState: GlobalState,
    path: string,
    buffer: Buffer
): Promise<UploadedFile> {
    const results = await bee.uploadData(globalState.stamp, buffer, { deferred: true })
    return {
        reference: results.reference,
        path
    }
}
