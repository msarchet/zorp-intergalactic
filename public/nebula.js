(() => { 
  const starClassifications = {
    O: { class: 'O', temperature: 40000, radius: 10, mass: 50, luminosity: 100000, life: 10, abundance: 0.0000001 },
    B: { class: 'B', temperature: 20000, radius: 5, mass: 10, luminosity: 1000, life: 100, abundance: 0.001 },
    A: { class: 'A', temperature: 8500, radius: 1.7, mass: 2, luminosity: 20, life: 1000, abundance: 0.007 },
    F: { class: 'F', temperature: 6500, radius: 1.3, mass: 1.5, luminosity: 4, life: 3000, abundance: 0.02},
    G: { class: 'G', temperature: 5700, radius: 1, mass: 1, luminosity: 1, life: 10000, abundance: 0.035 },
    K: { class: 'K', temperature: 4500, radius: 0.8, mass: 0.2, luminosity: 0.2, life: 50000, abundance: 0.08 },
    M: { class: 'M', temperature: 3200, radius: 0.3, mass: 0.01, luminosity: 0.01, life: 200000, abundance: 0.80 }
  }
  
  const modifyValue = (value, percentage) => {
    const delta = Math.random() * percentage * value
    const direction = Math.random() * 2
    if (direction < 1) { 
      value += delta
    } else if (direction < 2) { 
      value -= delta
    }
    
    return value
  }
  
  const modifyStar = star => { 
    star.temperature = modifyValue(star.temperature, .1)
    star.radius = modifyValue(star.radius, .25)
    star.mass = modifyValue(star.mass, .2)
    star.luminosity = modifyValue(star.luminosity, .1)
    star.life = modifyValue(star.life, .3)
    return star
  }

  const getStar = () => { 
    const pick = Math.random()
    let previous = 0
    
    if (pick <= starClassifications.O.abundance + previous) { 
      return modifyStar(Object.assign({} , starClassifications.O))
    }
    previous += starClassifications.O.abundance
    
    if (pick <= starClassifications.B.abundance + previous) { 
      return modifyStar(Object.assign({} , starClassifications.B))
    }
    previous += starClassifications.B.abundance
    
    if (pick <= starClassifications.A.abundance + previous) { 
      return modifyStar(Object.assign({} , starClassifications.A))
    }
    previous += starClassifications.A.abundance
    
    if (pick <= starClassifications.F.abundance + previous) { 
      return modifyStar(Object.assign({} , starClassifications.F))
    }
    previous += starClassifications.F.abundance
    
    if (pick <= starClassifications.G.abundance + previous) { 
      return modifyStar(Object.assign({} , starClassifications.G))
    }
    previous += starClassifications.G.abundance
    
    if (pick <= starClassifications.K.abundance + previous) { 
      return modifyStar(Object.assign({} , starClassifications.K))
    }
    previous += starClassifications.K.abundance
    
    return modifyStar(Object.assign({} , starClassifications.M))
  }
  
  window.getStar = getStar
})()