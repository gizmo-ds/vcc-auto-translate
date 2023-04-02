const supportedLanguages = ['zh-CN'];

if (supportedLanguages.includes(navigator.language)) start();

async function start() {
  const tr = (await fetch(`/localization/${navigator.language}.json`).then(
    (resp) => resp.json()
  )) as Record<string, string>;
  let observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      vcc_auto_translate(mutation.target as HTMLElement, tr);
    });
  });
  observer.observe(document.querySelector('#root')!, {
    childList: true,
    subtree: true,
  });
}

function vcc_auto_translate(node: HTMLElement, tr: Record<string, string>) {
  node.querySelectorAll('.fui-Button').forEach((e) => {
    e.childNodes.forEach((child) => {
      const text = child.textContent;
      if (text && tr[text]) {
        child.textContent = tr[text];
      }
    });
  });

  node
    .querySelectorAll('.fui-Title1, .fui-Title3, .fui-Subtitle1')
    .forEach((e) => {
      e.childNodes.forEach((child) => {
        const text = child.textContent;
        if (text && tr[text]) {
          child.textContent = tr[text];
          if (text === 'Projects') {
            //@ts-ignore
            e.style.whiteSpace = 'nowrap';
          }
        }
      });
    });

  node
    .querySelectorAll(
      '.fui-MenuList .fui-MenuItem, .fui-Option, .fui-OptionGroup__label'
    )
    .forEach((e) => {
      e.childNodes.forEach((child) => {
        const text = child.textContent;
        if (text && tr[text]) {
          child.textContent = tr[text];
        }
      });
    });

  node
    .querySelectorAll('.fui-Label, .fui-Caption1, .fui-Body1')
    .forEach((e) => {
      e.childNodes.forEach((child) => {
        const text = child.textContent;
        if (text && tr[text]) {
          child.textContent = tr[text];
        }
      });
    });

  node
    .querySelectorAll(
      '.fui-Tab>.fui-Tab__content, .fui-DataGridHeaderCell__button, .fui-TableHeaderCell__button'
    )
    .forEach((e) => {
      e.childNodes.forEach((child) => {
        const text = child.textContent;
        if (text && tr[text]) {
          child.textContent = tr[text];
        }
      });
    });
}
