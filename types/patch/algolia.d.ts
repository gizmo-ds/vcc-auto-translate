export interface Localization {
  translations: DocSearchTranslations
  placeholder: string
}

interface DocSearchTranslations
  extends ButtonTranslations,
    SearchBoxTranslations,
    FooterTranslations,
    ErrorScreenTranslations,
    StartScreenTranslations,
    NoResultsScreenTranslations {
  placeholder?: string
}

// https://github.com/algolia/docsearch/blob/2df2e1392fa80e5cc9cafac3437685331b9f07ec/packages/docsearch-react/src/DocSearchButton.tsx#L6-L9
type ButtonTranslations = Partial<{
  buttonText: string
  buttonAriaLabel: string
}>

// https://github.com/algolia/docsearch/blob/2df2e1392fa80e5cc9cafac3437685331b9f07ec/packages/docsearch-react/src/SearchBox.tsx#L14-L20
type SearchBoxTranslations = Partial<{
  resetButtonTitle: string
  resetButtonAriaLabel: string
  cancelButtonText: string
  cancelButtonAriaLabel: string
  searchInputLabel: string
}>

// https://github.com/algolia/docsearch/blob/2df2e1392fa80e5cc9cafac3437685331b9f07ec/packages/docsearch-react/src/Footer.tsx#L5-L14
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

// https://github.com/algolia/docsearch/blob/2df2e1392fa80e5cc9cafac3437685331b9f07ec/packages/docsearch-react/src/ErrorScreen.tsx#L5-L8
type ErrorScreenTranslations = Partial<{
  titleText: string
  helpText: string
}>

// https://github.com/algolia/docsearch/blob/2df2e1392fa80e5cc9cafac3437685331b9f07ec/packages/docsearch-react/src/StartScreen.tsx#L8-L15
type StartScreenTranslations = Partial<{
  recentSearchesTitle: string
  noRecentSearchesText: string
  saveRecentSearchButtonTitle: string
  removeRecentSearchButtonTitle: string
  favoriteSearchesTitle: string
  removeFavoriteSearchButtonTitle: string
}>

// https://github.com/algolia/docsearch/blob/2df2e1392fa80e5cc9cafac3437685331b9f07ec/packages/docsearch-react/src/NoResultsScreen.tsx#L7-L12
type NoResultsScreenTranslations = Partial<{
  noResultsText: string
  suggestedQueryText: string
  reportMissingResultsText: string
  reportMissingResultsLinkText: string
}>
