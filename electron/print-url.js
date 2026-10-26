import { pathToFileURL } from 'node:url'

export function printDocumentURL(devURL, filePath) {
  return devURL ? `${devURL}/print.html` : pathToFileURL(filePath).href
}
