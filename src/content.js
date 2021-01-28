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
    const  toRemove = e.target.parentNode.querySelectorAll('source[type="video/webm"], source[type="image/webp"]')
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
    checkDownloadButtons()
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


/** **/

const injectMemefulWindowIcon = (root = document) => {
  const controlsArray = root.querySelectorAll('.comment-input-area-footer .actions-area-secondary')


  for (const controls of controlsArray) {
    if(controls.querySelector('.enhancer-memeful-icon')) {
      continue
    }

    const img = document.createElement('img')
    img.src = 'https://icon-library.net/images/memes-icon/memes-icon-13.jpg'
    img.classList.add('enhancer-memeful-icon')
    img.width = '30'
    img.height = '30'

    controls.appendChild(img)
  }
}

setTimeout(injectMemefulWindowIcon, 1000)
const postComment = document.querySelector('.post-comment')

if(postComment) {
  postComment.addEventListener('mouseup', e => {
    if(e.target.classList.contains('enhancer-memeful-icon')) {
      const input = traverseUp(e.target, 'comment-composer__input-area').querySelector('textarea')
      showMemefulContainer(true, input)
    } else if(traverseUp(e.target, 'comment-composer__input-area')) { 
      injectMemefulWindowIcon(traverseUp(e.target, 'comment-composer__input-area'))
    } else if(traverseUp(e.target, 'comment-entry')) { 
      injectMemefulWindowIcon(traverseUp(e.target, 'comment-entry')?.parentNode)
    } else if (e.target.className.indexOf('enhancer-suggested-tags-option') !== -1) {
      loadImages(e.target.textContent)
      document.querySelector('.post-comment .enhancer-container-overlay .enhancer-search input').value = e.target.textContent
    }
  })
  postComment.addEventListener('mouseup', e => {
    if(e.target.classList.contains('reply-button')) {
      setTimeout(() => injectMemefulWindowIcon(traverseUp(e.target, 'comment-entry')?.parentNode), 100)
    }
  })
}


let currentCommentInput = null
const createMemefulContainer = () => {
  const el = document.querySelector('.post-comment')
  el.style.position = 'relative'

  const div = document.createElement('div');
  div.className = 'enhancer-container-overlay'

  div.innerHTML = htmlString.trim();
  div.querySelector('.enhancer-close').addEventListener('click', e => {
    showMemefulContainer(false)
  })

  let searchTimeout = null
  div.querySelector('.enhancer-search').addEventListener('keyup', e => {
    if (e.target.value === '') {
      return
    }

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // if 'enter' key dont wait for another key
    const isEnter = e.keyCode === 13
    searchTimeout = setTimeout(() => loadImages(e.target.value), isEnter ? 1 : 700)
  })


  div.querySelector('.enhancer-container').addEventListener('click', e => {
    if (e.target.className.indexOf('enhancer-memeful-image-source') !== -1) {
      const caretAt = currentCommentInput.selectionStart
      const val = currentCommentInput.value
      const url = e.target.src
      const comment = val.substring(0, caretAt) + url + val.substring(caretAt)
      currentCommentInput.value = comment
      currentCommentInput.dispatchEvent(new Event("input"));
      showMemefulContainer(false)
    }
  })

  el.prepend(div)
}


const showMemefulContainer = (show, input = null) => {
  const container = document.querySelector('.post-comment .enhancer-container-overlay')
  if (show) {
    container.style.display = 'block'
    container.querySelector('.enhancer-search').focus()
    loadImages('')
  } else {
    container.style.display = 'none'
  }

  currentCommentInput = input
}


const traverseUp = (root, classFragment) => {
  let el = root.parentElement

  while(el !== null) {
    if(Array.from(el.classList).some(c => c === classFragment))
      break

    el = el.parentElement
  }

  return el;
}

const loadImages = (search) => {
  const imagesCont = document.querySelector('.enhancer-memeful-images')
  const imagesCountCont = document.querySelector('.enhancer-memeful-images-count')
  const tagsCont = document.querySelector('.enhancer-suggested-tags')
  imagesCont.innerHTML = '<h2>LOADING...</h2>'

  getMemeful(search)
  .then(data => {
    imagesCont.innerHTML = ''

    if (data['error']) {
      imagesCont.innerHTML = `<h2>Error while fetching images. Response errror code: ${data.error}</h2>`
      return
    }

    const tagsCounter = []

    imagesCountCont.innerHTML = data.length
    if (data.length === 0){
      imagesCont.innerHTML = '<h2>No images for this search query.</h2>'
      return
    }
    const imgWidth = 150;
    for (const image of data) {
      const img = document.createElement('img')
      img.className = 'enhancer-memeful-image-source'
      img.width = imgWidth
      img.height = image.imageHeight / (image.imageWidth / imgWidth)
  
      img.src = image.animatedUrl

      imagesCont.appendChild(img)

      for (const tag of image.tags.split(',').map(tag => tag.trim())) {
        if (tag === search) {
          continue
        }

        if (!tagsCounter.find(t => t.name === tag)) {
          tagsCounter.push({name: tag, count: 0})
        }
        tagsCounter.find(t => t.name === tag).count++
      }
    }

    tagsCounter.sort((a, b) => b.count - a.count)

    tagsCont.innerHTML = '<span class="enhancer-suggested-tags-relative">Related tags:</span>' + tagsCounter.slice(0, 50).map(t => `<span class='enhancer-suggested-tags-option'>${t.name}</span>`).join(' ')
  })
}

const proxy = 'https://api.codetabs.com/v1/proxy?quest='
const downloadIconUrl = 'https://image.flaticon.com/icons/png/512/60/60721.png'
const spinnerUrl = 'https://cdn.shopify.com/s/files/1/2624/8830/t/36/assets/loader.gif?v=15552516830053958309'
console.log('asdasdasdasdasdd')
const getMemeful = (tag) => {
  let url = `${proxy}https://memeful.com/web/ajax/posts?page=1&count=${tag ? 250 : 25}&tags=${tag}`
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'GET',
    })
    .then(r => { return r.ok ? r.json() : { data: { error: r.status }}})
    .then(r => { resolve(r.data) })
    .catch(er => reject(er));
  })
}

const htmlString = `
<div class='enhancer-container'>
  <div class='enhancer-head'>
    <label class='enhancer-search'>Search: <input /></label>
      <span class='enhancer-close'>
        <img width='24' height='24' src='https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-close-512.png' />
      </span>
    <div>Images found: <span class='enhancer-memeful-images-count'></span></div>
    <div class='enhancer-suggested-tags'></div>
  </div>
  <div class='enhancer-memeful-images'></div>
</div>`

if (document.querySelector('.post-comment')) {
  createMemefulContainer()
  showMemefulContainer(false)
}


function downloadImage(url, name, el) {
  if (el.src === spinnerUrl) {
    return
  }

  el.src = spinnerUrl
  try {
    fetch(`${proxy}${url}`, {
        method: 'GET'
    })
    .then(response => response.blob())
    .then(blob => {
        el.src = downloadIconUrl
        var a = document.createElement('a')
        a.href = window.URL.createObjectURL(blob)
        a.download = name
        document.body.appendChild(a)
        a.click()
        a.remove()
    })  
  } catch (error) {
    el.src = downloadIconUrl
  }
 }

const checkDownloadButtons = () => {
  var template = `<img style="width: auto;" class="enhancer-download-icon" height="30" width="30" src='${downloadIconUrl}'>`

  const posts = document.querySelectorAll('.main-wrap article')

  for (const post of posts) {
    const el = post.querySelector('.post-container a')
    if (!el || el.parentNode.querySelector('.enhancer-download-icon')){
      continue
    }

    const dummy = document.createElement('div')
    dummy.innerHTML = template

    el.parentNode.appendChild(dummy.firstChild)
  }
}

checkDownloadButtons()

document.querySelector('.main-wrap').addEventListener('click', e => {
  if (e.target.classList.contains('enhancer-download-icon')) {
    const url = traverseUp(e.target, 'post-container').querySelector('picture img, video source[type="video/mp4"]').src
    const name = url.split('/')[url.split('/').length - 1]
    downloadImage(url, name, e.target)
  }
})
