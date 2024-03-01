import puppeteer from 'puppeteer'

export interface ProductData {
  id: string | null
  name: string
  nutrition: {
    score: string | unknown
    title: string
  }
  nova: {
    score: number | ''
    title: string
  }
}

export async function makeSearchProducts(
  novaCriteria: string,
  nutritionCriteria: string,
): Promise<ProductData[]> {
  const urlOpenFoodFacts = 'https://br.openfoodfacts.org/cgi/search.pl'
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(urlOpenFoodFacts)

  await page.waitForSelector('#tagtype_0')
  await page.select('#tagtype_0', 'nova_groups')
  await page.waitForSelector('#tagtype_1')
  await page.select('#tagtype_1', 'nutrition_grades')
  await page.type('input[name="tag_0"]', novaCriteria)
  await page.type('input[name="tag_1"]', nutritionCriteria)

  await page.click('#sort_by')
  await page.waitForSelector('#tagtype_2')
  await page.select('#tagtype_2', 'nova_groups')
  await page.select('#sort_by', 'unique_scans_n')
  await page.select('#page_size', '1000')
  await Promise.all([
    page.click('input[type="submit"][name="search"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ])

  const isNoProductsElementPresent = await page.evaluate(() => {
    return document.body.innerText.includes('Sem produtos.')
  })

  let data: ProductData[] = []

  if (!isNoProductsElementPresent) {
    await page.waitForSelector('#products_match_all')

    data = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll('#products_match_all li'),
      ).map((item): ProductData => {
        const url = item.querySelector('a')?.href ?? ''
        const idMatch = url.match(/produto\/(\d+)/)
        const id = idMatch ? idMatch[1] : null
        const name =
          (
            item.querySelector('.list_product_name') as HTMLElement
          )?.innerText.trim() ?? ''
        const nutritionScoreImage = item.querySelector<HTMLImageElement>(
          '.list_product_icons[src*="nutriscore"]',
        )
        const novaScoreImage = item.querySelector<HTMLImageElement>(
          '.list_product_icons[src*="nova-group"]',
        )
        const nutritionScore = nutritionScoreImage
          ? nutritionScoreImage.src
              .match(/nutriscore-(\w)\./)?.[1]
              .toUpperCase()
          : ''
        const novaScore = novaScoreImage
          ? parseInt(
              novaScoreImage.src.match(/nova-group-(\d)\./)?.[1] ?? '',
              10,
            )
          : 0
        const nutritionTitle = nutritionScoreImage?.title.split(' - ')[1] ?? ''
        const novaTitle = novaScoreImage?.title.replace('NOVA 1 - ', '') ?? ''

        return {
          id,
          name,
          nutrition: {
            score: nutritionScore,
            title: nutritionTitle,
          },
          nova: {
            score: novaScore,
            title: novaTitle,
          },
        }
      })
    })
  }

  await browser.close()
  return data
}
