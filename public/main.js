(() => { 

  const STAR_COUNT = 250000
  const BUCKET_SIZE = 30
  const RENDER_SCALE = 1
  const colorObject = { r: 255, g: 255, b: 255 }
  const starBuckets = { xBuckets: { } }
  const cachedFullCanvas = document.createElement('canvas')
  const cachedContext = cachedFullCanvas.getContext('2d')
  
  let fullFieldCached = false
  let CANVAS_HEIGHT = 720
  let CANVAS_WIDTH = 1280
  const stars = []
  
  const getCoordinateBucket = coordinate => coordinate / BUCKET_SIZE | 0
  const drawLocalRegion = (context, x,y) => {
    
      const xBucket = starBuckets.xBuckets[getCoordinateBucket(x)]
      if (xBucket) { 
        const yBucket = xBucket.yBuckets[getCoordinateBucket(y)]
        
        if (yBucket) {
          
          // get the stars within the bucket you clicked
          const localStars = yBucket.map(index => stars[index])
          
          // find the bounding box of all the stars
          const bounds = localStars.reduce((agg, star) => {
            
            if (star.boundingBox.left < agg.left) { 
              agg.left = star.boundingBox.left
            }
            
            if (star.boundingBox.top < agg.top) {
              agg.top = star.boundingBox.top
            } 
            
            if (agg.right < star.boundingBox.right) { 
              agg.right = star.boundingBox.right
            }
            
            if (agg.bottom < star.boundingBox.bottom) { 
              agg.bottom = star.boundingBox.bottom
            }
            
            return agg
            
          }, {
            left: Number.MAX_VALUE,
            top: Number.MAX_VALUE,
            right: 0,
            bottom: 0
          })
          
          // now get all the stars in that box to add them into the scene
          let visibleStarsIndicies = []
          const lowerXBucket = getCoordinateBucket(bounds.left)
          const upperXBucket = getCoordinateBucket(bounds.right)
          const lowerYBucket = getCoordinateBucket(bounds.top)
          const upperYBucket = getCoordinateBucket(bounds.bottom)
          
          for (let i = lowerXBucket; i <= upperXBucket; i++) {
            const xBucket = starBuckets.xBuckets[i]
            if (xBucket) {
              for (let j = lowerYBucket; j <= upperYBucket; j++) {
                const yBucket = xBucket.yBuckets[j]
                if (yBucket) {
                  visibleStarsIndicies = visibleStarsIndicies.concat(yBucket)
                }
              }
            }
          }
          
          const visibleStars = visibleStarsIndicies.sort((a, b) => a < b ? -1 : 1).map(index => stars[index])
          
          // get size of local region to scale to overlay
          const padding = 5
          const margin = 10
          const SCALE_FACTOR = Math.min(CANVAS_WIDTH / (bounds.right - bounds.left), CANVAS_HEIGHT / (bounds.bottom - bounds.top))
          
          const width = (bounds.right - bounds.left) * SCALE_FACTOR
          const height = (bounds.bottom - bounds.top) * SCALE_FACTOR
          
         
          context.fillStyle = 'rgba(0, 0, 0, 1)'
          const overlayBounds = { left: CANVAS_WIDTH / 2 - width / 2 - padding, top: CANVAS_HEIGHT / 2 - height / 2 - padding, width: width + padding * 2, height: height + padding * 2 }
          context.fillRect(overlayBounds.left, overlayBounds.top, overlayBounds.width, overlayBounds.height)
          
          const cursorPosition = { x: overlayBounds.left + padding, y: overlayBounds.top + padding }
          
          // scale localRegion dimensions and coordinates by scale factor
          // and move them relative to the new center
          const newCenter = { x: overlayBounds.width / 2, y: overlayBounds.height / 2 }
          const oldCenter = { x: (bounds.left + bounds.right) / 2, y: (bounds.top + bounds.bottom) / 2 }
          
          const clippingCanvas = document.createElement('canvas')
          clippingCanvas.width = overlayBounds.width - padding * 2
          clippingCanvas.height = overlayBounds.height - padding * 2
          
          const clippingContext = clippingCanvas.getContext('2d')
          visibleStars.forEach(star => { 
            const xDistance = star.coordinates.x - oldCenter.x
            const yDistance = star.coordinates.y - oldCenter.y
            
            const newX = xDistance * SCALE_FACTOR + newCenter.x
            const newY = yDistance * SCALE_FACTOR + newCenter.y
            
            const newSize = star.size * SCALE_FACTOR
            const newStar = { coordinates : { x: newX, y: newY }, size: newSize, details: Object.assign({}, star.details), alpha: star.alpha }
            drawStar(clippingContext, newStar)
          })
          
          context.drawImage(clippingCanvas, cursorPosition.x, cursorPosition.y)
        }
      }
  }
  
  const drawStar = (context, star) => {
    window.kelvinToRGB(star.details.temperature, colorObject)
    context.fillStyle =  `rgba(${colorObject.r | 0}, ${colorObject.g | 0}, ${colorObject.b| 0}, ${star.alpha})`
    context.beginPath()
    context.ellipse(star.coordinates.x, star.coordinates.y, star.size, star.size, 0, Math.PI * 2, false)
    context.fill()
  }
  
  const drawProgress = (context, current, total) => {
    const rectHeight = 1
    context.fillStyle = `rgba(0, 64, 0, 1)`
    context.fillRect(0, CANVAS_HEIGHT - rectHeight, CANVAS_WIDTH * current / total, rectHeight)
  }
  
  const drawStarField = (context, timestamp) => { 
   
    
   
    // adjust the maximum bound of stars to make sense for the screen
    const upperBound = STAR_COUNT * (CANVAS_WIDTH * CANVAS_HEIGHT) / (1280 * 720)
    const numberOfStars = Math.max(Math.random(), Math.random()) * upperBound | 0
    console.log(numberOfStars)
    
    for(var i = 0; i < numberOfStars; i++) { 
      
      // where do you go now!
      const coordinates = { x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT}
      
      // nebula.js
      const details = window.getStar()
      
      
      const size = details.radius * RENDER_SCALE
      // first find bounding rect for star
      const left = coordinates.x - size
      const right = coordinates.x + size
      const top = coordinates.y - size
      const bottom = coordinates.y + size
      const boundingBox = { left, right, top, bottom }
  
      const star = { coordinates, size, alpha: 1, details, boundingBox }
      
      const index = stars.length
      stars.push(star)
      
      // add index to lookup bucket
      
      // a sparse array of BUCKET_SIZE squares to find stars quicker
      // put star index in all buckets where star rendered
      for (let i = getCoordinateBucket(left) ; i <= getCoordinateBucket(right); i++) { 
        const xBucket = starBuckets.xBuckets[i] = starBuckets.xBuckets[i] || { yBuckets: {} }
        // getYBucket
        for (let j = getCoordinateBucket(top); j <= getCoordinateBucket(bottom); j++) {
          const yBucket = xBucket.yBuckets[j] = xBucket.yBuckets[j] || []
          yBucket.push(index)
        }
      }
    }
    
    window.requestAnimationFrame(newTimeStamp => {
      const waitTime = 5000 - (newTimeStamp - timestamp)
      window.setTimeout(() => {
         // fill canvas with night
          context.fillStyle = "#000000"
          context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        bringInStars(context,  0) 
      }, waitTime)
    })
  }
  
  
  const setupCanvasClickHandler = canvas => {
    const context = canvas.getContext('2d')
    canvas.onclick = e => {
        setupClearLocalregion(canvas)
        drawLocalRegion(context, e.clientX, e.clientY) 
    }
  }
  
  
  const setupClearLocalregion = canvas => { 
    canvas.onclick = _ =>  {
          const context = canvas.getContext('2d')
          setupCanvasClickHandler(canvas)
          drawClean(context)
        }
  }
  
  const finishStars = (context) => {
      fullFieldCached = true
      drawClean(context)
      const canvas = document.getElementById('begin')
      setupCanvasClickHandler(canvas)
  }
  
  const bringInStars = (context,  currentStar) => { 
    // pick a few stars to draw
    const count = Math.random() * (stars.length / 400) | 0
    
    for (let i = 0; i < count; i++) {
      if (currentStar == stars.length - 1)  {
        // we've drawn all stars start animating stars
        finishStars(context)
        return
      }
      
      drawProgress(context, currentStar, stars.length)
   
      currentStar += 1
      const star = stars[currentStar]
      drawStar(context, star)
      
      // also draw to cache
      drawStar(cachedContext, star)
    }
    
    setTimeout(() => window.requestAnimationFrame(() => bringInStars(context, currentStar)), 0)
  }
  

  
  const drawClean = context => { 
      if (!fullFieldCached) { 
        cachedFullCanvas.width = CANVAS_WIDTH
        cachedFullCanvas.height = CANVAS_HEIGHT
        cachedContext.fillStyle = `rgba(0, 0, 0, 1)`
        cachedContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        stars.forEach(star => drawStar(cachedContext, star))
    
        stars.forEach(star => drawStar(cachedContext, star))
        fullFieldCached = true
      }
    
      context.drawImage(cachedFullCanvas, 0, 0)
  }
  
  
  const drawWelcome = context => { 
    const canvasCenter = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }
    const text = [
      'Welcome intergalactic traveler.',
      'Enjoy the show, click to zoom.',
      '- Zorp'
    ]
    
    context.font = "48px arial"
    context.fillStyle = "rgba(255, 255, 255, 1)"
    const LINE_HEIGHT = 50
    
    // get widest line for centering
    
    const height = text.length * LINE_HEIGHT

    const cursor = { x: canvasCenter.x, y: canvasCenter.y - height / 2 }
    context.textAlign = 'center'
    text.forEach(line => { 
      context.fillText(line, cursor.x, cursor.y)
      cursor.y += LINE_HEIGHT
    })
    
    window.setTimeout(() => {
      window.requestAnimationFrame(timestamp => drawStarField(context, timestamp))
    }, 0)
  }
  
  const modifyValue = (value, delta) => { 
    const direction = Math.random() * 2
    if (direction < 1) { 
      value += delta
    } else if (direction < 2) { 
      value -= delta
    }
    
    return value
  }
  
  window.main = () => { 
    const canvas = document.getElementById('begin')
    const context = canvas.getContext('2d')
    
    canvas.height = CANVAS_HEIGHT = window.innerHeight
    canvas.width = CANVAS_WIDTH = window.innerWidth
    
    context.fillStyle = 'rgba(0,0,0,1)'
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // setup full cache canvas 

    cachedFullCanvas.width = CANVAS_WIDTH
    cachedFullCanvas.height = CANVAS_HEIGHT
    cachedContext.fillStyle = `rgba(0, 0, 0, 1)`
    cachedContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
 
    drawWelcome(context)

    
  }
})()