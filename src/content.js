(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


const SAFECLICKSTHRESHOLD = 3
const SCROLLPOSITIONCHANGEDTHRESHOLD = 4

let backgroundColor
let foregroundColor

let showControls
let keepMuted

let safeUrl
let enableDesperateClicks
let enableDistressedScroll

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'settingsSaved') {
    // refactor
    chrome.storage.sync.get('settings', result => {
      updateCachedSettings(result['settings'])

      updateThame()
      updateVideo()
    })
  }
})


const updateCachedSettings = (settings) => {
  if (settings === undefined) {
    return
  }

  safeUrl = settings.safeUrl
  enableDesperateClicks = settings.enableDesperateClicks
  enableDistressedScroll = settings.enableDistressedScroll

  backgroundColor = settings.customColors ? settings.backgroundColor : ''
  foregroundColor = settings.customColors ? settings.foregroundColor : ''

  showControls = settings.showControls
  keepMuted = settings.keepMuted
}

const updateThame = () => {
  document.body.style.setProperty('background-color', backgroundColor, 'important')
  for (const el of document.querySelectorAll('.main-wrap, .post-afterbar-a, .CS3')) {
    el.style.setProperty('background-color', backgroundColor, 'important')
  }

  const prevColor = window.getComputedStyle(document.querySelector("#top-nav li a")).color
  console.log(prevColor)
  let i = 0
  document.body.style.setProperty('color', foregroundColor, 'important')

  let temp = document.querySelectorAll('a, h1')
  for (const el of temp) {
    el.style.setProperty('color', foregroundColor, 'important')
    i++
    console.log(i)
  }

  temp = document.querySelectorAll("#top-nav li a")
  for (const el of temp) {
    el.style.setProperty('color', prevColor, 'important')
  }
}

const updateVideo = () => {
  for (const el of document.querySelectorAll('video')) {
    el.controls = showControls

    el.muted = keepMuted
    const toggleSoundEl = el.parentElement.getElementsByClassName('sound-toggle')[0]
    
    if (toggleSoundEl) {
      toggleSoundEl.classList.remove(keepMuted ? 'on' : 'off')
      toggleSoundEl.classList.add(keepMuted ? 'off' : 'on')
    }
  }
}

chrome.storage.sync.get('settings', result => {
  updateCachedSettings(result['settings'])

  updateThame()
  updateVideo()
})


document.body.addEventListener('mousedown', (e) => {
  if (e.target.tagName = 'IMG') {
    const  toRemove = e.target.parentElement.getElementsByTagName('source')
    for (const el of toRemove) {
      el.remove()
    }
  }
})

let tripleClickTimer = null
let tripleClickCount = 0
document.body.addEventListener('mouseup', (e) => {
  tripleClickCount++

  if (tripleClickTimer) {
    clearTimeout(tripleClickTimer)
  }

  if (enableDesperateClicks && tripleClickCount >= SAFECLICKSTHRESHOLD){
    tripleClickCount = 0
    initInDangerProtocol()
  }

  tripleClickTimer = setTimeout(() => {
    tripleClickCount = 0
  }, 300)
})

const initInDangerProtocol = () => {
  if (safeUrl) {
    window.open(safeUrl)
  } else {
    window.open('https://en.wikipedia.org/wiki/Special:Random')
  }
}

let scrollCountTimer = null
let prevScrolPos = 0
let scrollPositionChangedCount = 0
let scrollDirection = ''

window.addEventListener('scroll', e => {  
  let newScrollDir = (window.scrollY > prevScrolPos) ? 'up' : 'down'

  if (enableDistressedScroll && newScrollDir !== scrollDirection) {
    scrollDirection = newScrollDir
    scrollPositionChangedCount++
    if (scrollPositionChangedCount >= SCROLLPOSITIONCHANGEDTHRESHOLD){
      initInDangerProtocol()
    }

    if (scrollCountTimer) {
      clearTimeout(scrollCountTimer)
    }
    scrollCountTimer = setTimeout(() => {
      scrollPositionChangedCount = 0
    }, 300)
  }

  prevScrolPos = window.scrollY
})



let lastUpdatePos = 0
window.addEventListener('scroll', e => {
  if (Math.abs(lastUpdatePos - window.scrollY) > 3000) {
    lastUpdatePos = window.scrollY
    
    updateThame()
    updateVideo()
  }
})





window.addEventListener('error', e =>  {

  console.log(e)
})

/// todo: 
/// change icon