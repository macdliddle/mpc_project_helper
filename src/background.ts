export {}

const matches = chrome.runtime.getManifest().content_scripts?.flatMap(script => script.matches ?? []) ?? []

if (!__FIREFOX__) {
  // Chrome can enable the action declaratively without watching tab events.
  const conditions = matches.map(match => new chrome.declarativeContent.PageStateMatcher({
    pageUrl: { urlMatches: match },
  }))

  chrome.runtime.onInstalled.addListener(() => {
    chrome.action.disable()
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions,
        actions: [new chrome.declarativeContent.ShowAction()],
      }])
    })
  })
} else {
  // Firefox MV3 uses an event page and has no declarativeContent API.
  const allowedOrigins = new Set(matches.map(match => new URL(match.replace(/\*$/, '')).origin))
  const updateAction = (tab: chrome.tabs.Tab) => {
    if (tab.id === undefined) return
    let allowed = false
    try {
      allowed = tab.url !== undefined && allowedOrigins.has(new URL(tab.url).origin)
    } catch {
      // Tabs such as about:blank have no supported site origin.
    }
    if (allowed) chrome.action.enable(tab.id)
    else chrome.action.disable(tab.id)
  }

  chrome.action.disable()
  chrome.tabs.query({}, tabs => tabs.forEach(updateAction))
  chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => updateAction(tab))
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.tabs.get(tabId, tab => {
      if (tab) updateAction(tab)
    })
  })
}

chrome.action.onClicked.addListener(tab => {
  if (tab.id === undefined) return
  chrome.tabs.sendMessage(tab.id, { message: 'show' })
})
