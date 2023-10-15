export async function createHtml5(head: string, body: string): Promise<string> {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <link rel="icon" href="favicon.png">
            ${head}
        </head>
        <body>
            ${body}
        </body>
    </html>`
}
