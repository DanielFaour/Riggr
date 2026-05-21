function localizedValue(product, englishKey, fallbackKey, language) {
  const englishValue = String(product?.[englishKey] || '').trim()
  const fallbackValue = String(product?.[fallbackKey] || '').trim()

  return language === 'en' && englishValue ? englishValue : fallbackValue
}

export function getProductName(product, language) {
  return localizedValue(product, 'nameEn', 'name', language)
}

export function getProductCategory(product, language) {
  return localizedValue(product, 'categoryEn', 'category', language)
}

export function getProductDescription(product, language) {
  return localizedValue(product, 'descriptionEn', 'description', language)
}

export function getProductSearchText(product, language) {
  return [
    getProductName(product, language),
    getProductCategory(product, language),
    getProductDescription(product, language),
    product?.name,
    product?.category,
    product?.description,
  ]
    .filter(Boolean)
    .join(' ')
}

