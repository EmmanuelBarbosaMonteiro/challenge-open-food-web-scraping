import puppeteer from 'puppeteer'

export interface ProductDetails {
  title: string
  quantity: string
  ingredients: {
    hasPalmOil: string
    isVegan: boolean
    isVegetarian: boolean
    list: string[]
  }
  nutrition: {
    score: string | null
    values: ((string | undefined)[] | null)[]
    servingSize: string
    data: unknown
    nova: unknown
  }
}

export async function makeSearchProductsById(
  idProduct: string,
): Promise<ProductDetails | null> {
  const urlOpenFoodFacts = `https://br.openfoodfacts.org/produto/${idProduct}`

  console.log('Iniciando o navegador...')
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  console.log(`Acessando a URL do produto: ${urlOpenFoodFacts}`)
  await page.goto(urlOpenFoodFacts)

  const getTextContent = async (selector: string): Promise<string> => {
    const element = await page.$(selector)
    if (element) {
      return page.evaluate((el) => el.textContent?.trim() || '', element)
    }
    return ''
  }

  const isProductNotFound = (await page.$('.title-1')) === null
  if (isProductNotFound) {
    await browser.close()

    console.log('Produto não encontrado. Encerrando processo.')
    return null
  }

  console.log('Coletando informações básicas do produto...')
  const title = await getTextContent('.title-1')

  const quantity = await getTextContent('#field_quantity_value')
  const hasPalmOil = 'unknown'

  console.log('Determinando status vegano e vegetariano do produto...')
  const categoriesAndLabels = await page.evaluate(() => {
    const categories = Array.from(
      document.querySelectorAll('#field_categories_value .tag'),
    ).map((el) => el.textContent)
    const labels = Array.from(
      document.querySelectorAll('#field_labels_value .tag'),
    ).map((el) => el.textContent)

    const isVegan = categories
      .concat(labels)
      .some((text) => text?.toLowerCase().includes('vegan'))
    const isVegetarian =
      categories
        .concat(labels)
        .some((text) => text?.toLowerCase().includes('vegetarian')) || isVegan

    return { isVegan, isVegetarian }
  })

  console.log('Coletando lista de ingredientes...')
  const ingredientsList = await getTextContent(
    '#panel_ingredients_content .panel_text',
  )

  console.log('Avaliando Nutri-Score...')
  const nutritionScore = await page.$eval('.attr_text h4', (el) => {
    const fullText = el.innerText
    const scoreMatch = fullText.match(/Nutri-Score\s([A-E])/)
    return scoreMatch ? scoreMatch[1] : null
  })

  console.log('Coletando valores nutricionais...')
  const nutritionValues = await page.evaluate(() => {
    const panels = Array.from(document.querySelectorAll('.panel_accordion'))
    return panels
      .map((panel) => {
        const imgElement = panel.querySelector('img')
        const titleElement = panel.querySelector('.evaluation__title')

        if (!imgElement || !titleElement) return null

        const iconSrc = imgElement.src
        const title = titleElement.textContent?.trim()

        const level = iconSrc.includes('moderate.svg')
          ? 'moderate'
          : iconSrc.includes('high.svg')
            ? 'high'
            : iconSrc.includes('low.svg')
              ? 'low'
              : null

        return level ? [level, title] : null
      })
      .filter((item) => item !== null)
      .slice(0, 3)
  })

  console.log('Determinando o tamanho da porção...')
  const servingSizeElement = await page.$('#panel_serving_size .panel_text')
  const servingSize = servingSizeElement
    ? await page.evaluate((el) => {
        const fullText = el.textContent || ''
        const match = fullText.match(/Tamanho da porção:\s*(\d+g)/)
        return match ? match[1] : ''
      }, servingSizeElement)
    : ''

  console.log('Coletando dados da tabela nutricional...')
  const dataTable = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'))
    const nutritionData: {
      [key: string]: {
        per100g: string
        perServing: string
      }
    } = {}

    rows.forEach((row) => {
      const nutrientName = row.querySelector('td')?.textContent?.trim() ?? ''
      const per100g = row.querySelectorAll('td')[1]?.textContent?.trim() ?? ''
      const perServing =
        row.querySelectorAll('td')[2]?.textContent?.trim() ?? ''

      nutritionData[nutrientName] = { per100g, perServing }
    })

    return nutritionData
  })

  console.log('Determinando informações do grupo NOVA...')
  const novaInfo = await page.evaluate(() => {
    const imgElement = document.querySelector(
      'a[href="#panel_nova_content"] img',
    )
    const titleElement = document.querySelector(
      'a[href="#panel_nova_content"] h4',
    )

    let score = null
    if (
      imgElement &&
      (imgElement as HTMLImageElement).src.includes('nova-group')
    ) {
      const match = (imgElement as HTMLImageElement).src.match(
        /nova-group-(\d)\.svg/,
      )
      score = match ? parseInt(match[1], 10) : null
    }

    const title = titleElement?.textContent?.trim() ?? ''

    return {
      score,
      title,
    }
  })

  console.log('Finalizando o navegador e retornando os dados coletados.')
  await browser.close()

  console.log('Processo concluido.')
  return {
    title,
    quantity,
    ingredients: {
      hasPalmOil,
      isVegan: categoriesAndLabels.isVegan,
      isVegetarian: categoriesAndLabels.isVegetarian,
      list: [ingredientsList],
    },
    nutrition: {
      score: nutritionScore,
      values: nutritionValues,
      servingSize,
      data: dataTable,
      nova: novaInfo,
    },
  }
}
