import * as ts from 'typescript'
import * as path from 'path'

export function transformer (): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => (file: ts.SourceFile) => addMetadata(file, context)
}

function addMetadata (node: ts.SourceFile, context: ts.TransformationContext) {
    return node
}
