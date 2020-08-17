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
  let i = 0
  document.body.style.setProperty('color', foregroundColor, 'important')

  let temp = document.querySelectorAll('a, h1')
  for (const el of temp) {
    el.style.setProperty('color', foregroundColor, 'important')
    i++
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


const POTATO_IMGS = [
  'https://i.imgur.com/UjbOYTN_d.webp?maxwidth=728&fidelity=grand',
  'https://cdn.shopify.com/s/files/1/1017/2183/t/2/assets/live-preview-potato-standing.png?11613543951065886057',
  'https://www.spudfit.com/wp/wp-content/uploads/2020/03/Potato.H03-3.png',
  'https://i.pinimg.com/originals/25/7b/d1/257bd19e4e08f73db001a49a732c3592.png',
  'https://i.pinimg.com/originals/10/57/dd/1057dd4e269659a4974175909bcc54f5.png',

]
const DISTANCE_FOR_POTATO = 100000

let scrolledForPotatoes = 0
let lastScrolledForPotatoes = 0

window.addEventListener('scroll', e => {
  if (lastScrolledForPotatoes !== 0) {
    scrolledForPotatoes += Math.abs(lastScrolledForPotatoes - window.scrollY)
  }
  
  if (scrolledForPotatoes > DISTANCE_FOR_POTATO) {
    scrolledForPotatoes = 0

    const randomPotato = randomize(0, POTATO_IMGS.length)

    var randomLeftPosition = randomize(100, window.innerWidth - 256 - 100 )

    const potatoImage = document.createElement('img')
    potatoImage.classList.add('potato')
    potatoImage.src = POTATO_IMGS[randomPotato]
    potatoImage.style.position = 'absolute'
    potatoImage.style.width = '256px'
    potatoImage.style.height = 'auto'
    potatoImage.style.zIndex = 9000

    potatoImage.style.left = `${(randomLeftPosition)}px`
    potatoImage.style.top = `${window.scrollY + window.outerHeight}px`
    document.body.appendChild(potatoImage)

    potatoImage.onclick = e => {
      e.target.remove()
    }
  }
  
  lastScrolledForPotatoes = window.scrollY
})

const randomize = (min, max) => {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min)
}
