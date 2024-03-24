import { language } from '../localization'
import { Config } from './patch'

const info = {
  apiKey: process.env.ALGOLIA_APIKEY,
  appId: process.env.ALGOLIA_APPID,
  indexName: process.env.ALGOLIA_INDEXNAME,
}
const is_str_set = (v: string | undefined) => v && v != ''
const replace = is_str_set(info.apiKey) && is_str_set(info.appId) && is_str_set(info.indexName)

const fname = '__algolia_patch__'
let localization: DocSearchTranslations = {}

function func(e: any, t: any) {
  if (!e) return t
  if (!(t.apiKey && t.appId && t.appId && t.placeholder)) return t

  t.placeholder = localization.placeholder
  t.translations = localization
  if (replace) {
    t.apiKey = info.apiKey
    t.appId = info.appId
    t.indexName = info.indexName
  }
  return t
}

const config: Config = {
  patch_jsx: {
    fname,
    async after() {
      const supported_languages = {
        'zh-CN': (await import('@/localization/algolia.zh_CN.json')).default,
        'zh-TW': (await import('@/localization/algolia.zh_TW.json')).default,
      }
      localization =
        supported_languages[language] ?? (await import('@/localization/algolia.en.json')).default
      globalThis[fname] = func
    },
  },
}

export default config

// https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/DocSearch.tsx#L21-L24
type DocSearchTranslations = Partial<{
  button: ButtonTranslations
  modal: ModalTranslations
  placeholder: string
}>

//https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/DocSearchButton.tsx#L6-L9
type ButtonTranslations = Partial<{
  buttonText: string
  buttonAriaLabel: string
}>

// https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/DocSearchModal.tsx#L35-L39
type ModalTranslations = Partial<{
  searchBox: SearchBoxTranslations
  footer: FooterTranslations
}> &
  ScreenStateTranslations

// https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/SearchBox.tsx#L14-L20
type SearchBoxTranslations = Partial<{
  resetButtonTitle: string
  resetButtonAriaLabel: string
  cancelButtonText: string
  cancelButtonAriaLabel: string
  searchInputLabel: string
}>

// https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/Footer.tsx#L5-L14
type FooterTranslations = Partial<{
  selectText: string
  selectKeyAriaLabel: string
  navigateText: string
  navigateUpKeyAriaLabel: string
  navigateDownKeyAriaLabel: string
  closeText: string
  closeKeyAriaLabel: string
  searchByText: string
}>

// https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/ScreenState.tsx#L19-L23
type ScreenStateTranslations = Partial<{
  errorScreen: ErrorScreenTranslations
  startScreen: StartScreenTranslations
  noResultsScreen: NoResultsScreenTranslations
}>

// https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/ErrorScreen.tsx#L5-L8
type ErrorScreenTranslations = Partial<{
  titleText: string
  helpText: string
}>

// https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/StartScreen.tsx#L8-L15
type StartScreenTranslations = Partial<{
  recentSearchesTitle: string
  noRecentSearchesText: string
  saveRecentSearchButtonTitle: string
  removeRecentSearchButtonTitle: string
  favoriteSearchesTitle: string
  removeFavoriteSearchButtonTitle: string
}>

// https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/NoResultsScreen.tsx#L7-L12
type NoResultsScreenTranslations = Partial<{
  noResultsText: string
  suggestedQueryText: string
  reportMissingResultsText: string
  reportMissingResultsLinkText: string
}>
