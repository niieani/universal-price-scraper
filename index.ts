import csv from 'csvtojson/v2'
import json2csv from 'json2csv'
import axios from 'axios'
import * as symbolMap from 'currency-symbol-map/map'
import * as path from 'path'
import {Result} from './types'
import { writeFile } from 'fs'
import { promisify } from 'util'
import token from './api-key'
const writeFileAsync = promisify(writeFile)

const currencyIsoToSymbol = Object.entries(symbolMap)

type Links = {
  Window: string,
  Title: string,
  URL: string,
}

type BoolString = 'Yes' | 'No'

type Item = {
  title: string,
  url: string,
  window: string,
  hasData: BoolString,
  category?: string,
  availability?: BoolString,
  brand?: string,
  description?: string,
  priceUnit?: string,
  priceRegular?: number | string,
  price?: number | string,
  image?: string,
}

function doQuery(url: string) {
  console.log(`Making a request regarding: ${url}\n`)
  return axios.get<Result>('https://api.diffbot.com/v3/analyze', {
    params: {
      url,
      token,
      mode: 'product',
      discussion: false,
    }
  }).catch((e) => {
    console.log(`Error while making the request: ${e.message}\n`)
  })
}

const safeRequire = (file: string): any => {
  try {return require(file)} catch (e) {}
}

const boolToYesNo = (bool: boolean): BoolString => bool ? 'Yes' : 'No'

async function run() {
  const links: Array<Links> = await csv().fromFile(path.join(__dirname, 'links.csv'))
  const output: Array<Item> = []
  const results: Array<Result> = safeRequire('./results.json') || []

  const outFileCSV = path.join(__dirname, 'output.csv')
  const outFileJSON = path.join(__dirname, 'results.json')

  for (const { URL, Window, Title } of links) {
    const prevResult = results.find(({request: {pageUrl}}) => pageUrl === URL)
    const result = prevResult ? { data: prevResult } : await doQuery(URL)

    if (result && result.data && result.data.objects && result.data.objects.length) {
      results.push(result.data)
      if (!prevResult) {
        await writeFileAsync(outFileJSON, JSON.stringify(results, null, 2))
      }

      result.data.objects.forEach(({
        availability,
        brand,
        category,
        title,
        offerPrice,
        offerPriceDetails: { symbol, amount: price } = { symbol: '', amount: offerPrice },
        pageUrl: url,
        text: description,
        regularPrice,
        regularPriceDetails: { amount: priceRegular } = { amount: regularPrice },
        images,
      }) => {
        const image = images && images.length
          ? images[0].url
          : ''
        const object : Item = {
          availability: boolToYesNo(availability),
          brand,
          category,
          title,
          price,
          priceUnit: symbol === '$'
            ? 'USD'
            : symbol === '£'
            ? 'GBP'
            : (currencyIsoToSymbol.find(([iso, s]) => s === symbol) || [symbol])[0],
          url,
          description,
          priceRegular,
          image,
          window: Window,
          hasData: boolToYesNo(true),
        }
        output.push(object)
      })
    } else {
      output.push({
        url: URL,
        title: Title,
        window: Window,
        hasData: boolToYesNo(false),
      })
      console.log(`Missing data for: ${URL}\n`)
    }

    const resultCSV = json2csv.parse(output)
    await writeFileAsync(outFileCSV, resultCSV)
  }

  return outFileCSV
}

run().then(
  (outFile) => { console.log(`Successfully written: ${outFile}`) },
  (e) => { console.error(`Unable to complete: ${e.message}`) }
)
