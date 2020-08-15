if (chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(details => {
    const initialSettings = {
      customColors: false,
      backgroundColor: '#ffffff',
      foregroundColor: '#000000',
      showControls: true,
      keepMuted: true,
      safeUrl: '',
      enableDesperateClicks: false,
      enableDistressedScroll: false
    }

    if (chrome.runtime.OnInstalledReason.INSTALL) {
      chrome.storage.sync.set({'settings': initialSettings}, result => {
      })
    }
  })
}
