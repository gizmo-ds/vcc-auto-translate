import { fluentProgress, provideFluentDesignSystem } from '@fluentui/web-components'
import styles from './loading.module.css'

export function LoadingComponent(props: { text: string }) {
  provideFluentDesignSystem().register(fluentProgress())

  const app_theme = localStorage.getItem('app_theme')
  let color_scheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? styles.dark
    : styles.light
  switch (app_theme) {
    case 'Dark':
      color_scheme = styles.dark
      break
    case 'Light':
      color_scheme = styles.light
    default:
      break
  }
  return (
    <div class={[styles.patchLoadingCover, color_scheme].join(' ')}>
      <p class={styles.patchLoadingText} id="text">
        {props.text}
      </p>
      {/* @ts-ignore */}
      <fluent-progress class={styles.patchLoadingProgress} />
    </div>
  )
}
