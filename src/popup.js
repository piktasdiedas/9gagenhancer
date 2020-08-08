var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-113292078-3']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


const SETTINGS_KEY = 'settings'
const settingsKeys = ['customColors', 'backgroundColor', 'foregroundColor', 'showControls', 'keepMuted', 'safeUrl', 'enableDesperateClicks', 'enableDistressedScroll']
const storageType = 'sync'


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


getSettings()
  .then(settings => {
    for (const key of settingsKeys) {
      settings[key] = settings[key] || initialSettings[key]
    }

    const containerEl = document.getElementById('optionsContainer')

    for (const key of settingsKeys) {
      const els = containerEl.querySelectorAll(`[name=${key}]`)
      if (els.length === 0) continue

      if (settings[key]) {
        if(els[0].type === 'checkbox')
          els[0].checked = settings[key]
        else 
          els[0].value = settings[key]
      }
    }

    updatePopupColors(settings)
  })

const updatePopupColors = (settings) => {
  if (settings.customColors) {
    document.body.style.background = settings.background
    document.body.style.color = settings.foreground
  } else {
    document.body.style.background = ''
    document.body.style.color = ''
  }
}

document.addEventListener('DOMContentLoaded', _ => {
  
  const onSave = () => {
    getSettings()
      .then(r => {
        for (const key of settingsKeys) {
          r[key] = r[key] || initialSettings[key]
        }    
    
        const containerEl = document.getElementById('optionsContainer')

        for (const key of settingsKeys) {
          const els = containerEl.querySelectorAll(`[name=${key}]`)
          if (els.length === 0) throw new Error(`No element wiht name: '${key}'.`)
  
          if(els[0].type === 'checkbox')
            r[key] = els[0].checked
          else 
            r[key] = els[0].value
        }

        setSettings(r)
          .then(r2 => {
            updatePopupColors(r)
            chrome.tabs.query({currentWindow: true, url: "https://9gag.com/*"}, tabs => {
              for (const tab of tabs) {
                console.log(tab)
                chrome.tabs.sendMessage(tab.id, { action: 'settingsSaved' }, response => {

                })
              }
            })
          })
      })
  }

  document.getElementById('saveSettings').addEventListener('click', onSave)
})



function getSettings(p) {
  const type = p?.type || storageType
  return new Promise(function(resolve, reject) {
    chrome.storage[type].get([SETTINGS_KEY], result => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        resolve({ ...result[SETTINGS_KEY]})
      }
    })
  })
}


function setSettings(value, p) {
  const type = p?.type || storageType
  return new Promise(function(resolve, reject) {
    chrome.storage[type].set({[SETTINGS_KEY]: value}, result => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(value)
      }
    })
  })
}
