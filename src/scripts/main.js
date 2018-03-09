(() => {
  const app = {
    elements: {
      buildingBtns: document.querySelectorAll('[name="building"]'),
      dateBtns: document.querySelectorAll('[name="date"]'),
      background: document.querySelector('.background'),
      posters: document.querySelector('.posters')
    },
    flkty: '',
    isFlkty: false,
    init: function () {
      api.init()
      this.handleEvents()
    },
    handleEvents: function () {
      this.elements.buildingBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          api.setCurrentBuilding(Number(btn.value))
          api.init()
        })
      })
      this.elements.dateBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          api.currentDate = Number(btn.value)
          api.init()
        })
      })
    },
    createPoster: function (title, date, url, desc) {
      let newTitle = title.replace(`${api.buildings[api.currentBuilding].name}`, `<span>${api.buildings[api.currentBuilding].name}</span>`)
      let newUrl = url.replace('level3', 'level2')

      let el = `
      <article class="carousel-cell">
        <div class="poster-text">
          <h1>${newTitle}</h1>
          <h1>${date}</h1>
        </div>
        <img src="${newUrl}">
      </article>
      `
      return el
    },
    render: function (data) {
      let posters = []
      data.forEach((item) => {
        posters += this.createPoster(item.title, item.date, item.url)
      })
      if (this.isFlkty) {
        this.flkty.destroy()
      }
      helper.replaceHTML(this.elements.posters, posters)
      let elem = document.querySelector('.main-carousel');
      this.flkty = new Flickity(elem, {
        wrapAround: true
      })
      this.isFlkty = true
    }
  }
  const api = {
    elements: {
      loader: document.querySelector('#loader-wrapper')
    },
    buildings: [
      {
        name: 'Paradiso',
        address: 'Weteringschans 6',
        dateRange: [
          ['1968-05-23T10:20:13+05:30', '1972-05-23T10:20:13+05:30'],
          ['1972-05-23T10:20:13+05:30', '1975-05-23T10:20:13+05:30'],
          ['1975-05-23T10:20:13+05:30', '1980-05-23T10:20:13+05:30'],
          ['1980-05-23T10:20:13+05:30', '1990-05-23T10:20:13+05:30'],
          ['1990-05-23T10:20:13+05:30', '2100-05-23T10:20:13+05:30']
        ]
      },
      {
        name: 'Melkweg',
        address: 'Lijnbaansgracht 234A',
        dateRange: [
          ['1968-05-23T10:20:13+05:30', '2017-05-23T10:20:13+05:30'],
          ['1972-05-23T10:20:13+05:30', '1975-05-23T10:20:13+05:30'],
          ['1975-05-23T10:20:13+05:30', '1980-05-23T10:20:13+05:30'],
          ['1980-05-23T10:20:13+05:30', '1990-05-23T10:20:13+05:30'],
          ['1990-05-23T10:20:13+05:30', '2100-05-23T10:20:13+05:30']
        ]
      }
    ],
    dateRange: [
      ['1970-05-23T10:20:13+05:30', '1980-05-23T10:20:13+05:30'],
      ['1980-05-23T10:20:13+05:30', '1990-05-23T10:20:13+05:30'],
      ['1990-05-23T10:20:13+05:30', '2000-05-23T10:20:13+05:30'],
      ['2000-05-23T10:20:13+05:30', '2100-05-23T10:20:13+05:30']
    ],
    currentBuilding: 0,
    currentDate: 0,
    init: function () {
      if (window.localStorage.getItem('currentBuilding')) {
        this.currentBuilding = JSON.parse(window.localStorage.getItem('currentBuilding'))
        app.elements.buildingBtns[this.currentBuilding].checked = true
      } else {
        this.currentBuilding = 0
        window.localStorage.setItem('currentBuilding', JSON.stringify(0))
      }
      this.handleData()
    },
    setCurrentBuilding: function (number) {
      window.localStorage.setItem('currentBuilding', JSON.stringify(number))
      return number
    },
    generateUrl: function (type, limit) {
      let query
      if (type === 'posters') {
        query = `
          PREFIX dc: <http://purl.org/dc/elements/1.1/>
          PREFIX foaf: <http://xmlns.com/foaf/0.1/>
          PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
          SELECT ?poster ?title ?img ?date WHERE {
            ?poster dc:type "Poster."^^xsd:string .
            ?poster dc:title ?title .
            ?poster dc:subject "Music."^^xsd:string .
            ?poster foaf:depiction ?img .
            FILTER REGEX(?title, "${this.buildings[this.currentBuilding].name}") .
            ?poster sem:hasBeginTimeStamp ?date .
            FILTER (?date > "${this.dateRange[this.currentDate][0]}"^^xsd:dateTime && ?date < "${this.dateRange[this.currentDate][1]}"^^xsd:dateTime)
          }
          ORDER BY ?date
        `
      } else if (type === 'count') {
        query = `
          PREFIX foaf: <http://xmlns.com/foaf/0.1/>
          PREFIX dc: <http://purl.org/dc/elements/1.1/>
          PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
          SELECT count(*) as ?count WHERE {
            ?photo dc:type "foto"^^xsd:string .
            ?photo dc:title ?title .
            ?photo foaf:depiction ?img .
            FILTER REGEX(?title, "${this.buildings[this.currentBuilding].address}") .
            ?photo sem:hasBeginTimeStamp ?date .
            FILTER (?date > "${this.buildings[this.currentBuilding].dateRange[this.currentDate][0]}"^^xsd:dateTime && ?date < "${this.buildings[this.currentBuilding].dateRange[this.currentDate][1]}"^^xsd:dateTime)
          }
        `
      } else if (type === 'background') {
        query = `
          PREFIX foaf: <http://xmlns.com/foaf/0.1/>
          PREFIX dc: <http://purl.org/dc/elements/1.1/>
          PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
        
          SELECT ?photo ?title ?img ?date WHERE {
            ?photo dc:type "foto"^^xsd:string .
            ?photo dc:title ?title .
            ?photo foaf:depiction ?img .
            FILTER REGEX(?title, "${this.buildings[this.currentBuilding].address}") .
            ?photo sem:hasBeginTimeStamp ?date .
            FILTER (?date > "1968-05-23T10:20:13+05:30"^^xsd:dateTime && ?date < "2017-05-23T10:20:13+05:30"^^xsd:dateTime)
          }
          ORDER BY ?date OFFSET ${limit} LIMIT 1
        `
      }
      let encodedQuery = encodeURIComponent(query)
      return `https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=${encodedQuery}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`
    },
    getData: function (url) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('get', url)
        xhr.onload = () => resolve(xhr.responseText)
        xhr.onerror = () => reject(xhr.statusText)
        xhr.send()
      })
    },
    handleData: function () {
      let loaded = 0
      let limit
      this.getData(this.generateUrl('posters')).then((result) => {
        let data = JSON.parse(result).results.bindings
        let usefulData = data.map((item) => {
          let obj = {
            title: item.title.value,
            date: item.date.value,
            url: item.img.value
          }
          return obj
        })
        window.localStorage.setItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_posters`, JSON.stringify(usefulData))
        app.render(usefulData)
        loaded++
        this.updateLoader(loaded)
      })
      let randomNum
      if (window.localStorage.getItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_count`)) {
        limit = JSON.parse(window.localStorage.getItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_count`))
        randomNum = helper.randomize(1, limit) - 1
        if (window.localStorage.getItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_background-${this.currentDate}-${randomNum}`)) {
          let url = JSON.parse(window.localStorage.getItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_background-${this.currentDate}-${randomNum}`))
          app.elements.background.style.backgroundImage = `url(${url})`
        } else {
          this.getData(this.generateUrl('background', randomNum)).then((result) => {
            console.log(result)
            let oldUrl = JSON.parse(result).results.bindings[0].img.value
            let newUrl = this.storeBackground(oldUrl)
            window.localStorage.setItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_background-${this.currentDate}-${randomNum}`, JSON.stringify(newUrl))
            app.elements.background.style.backgroundImage = `url(${newUrl})`
          })
        }
        loaded = loaded + 2
        this.updateLoader(loaded)
      } else {
        this.getData(this.generateUrl('count')).then((result) => {
          limit = JSON.parse(result).results.bindings[0].count.value
          randomNum = helper.randomize(1, limit) - 1
          window.localStorage.setItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_count`, JSON.stringify(limit))
          loaded++
          this.updateLoader(loaded)
        }).then(() => {
          this.getData(this.generateUrl('background', helper.randomize(1, limit) - 1)).then((result) => {
            window.localStorage.setItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_background-${this.currentDate}-${randomNum}`, JSON.stringify(newUrl))
            loaded++
            this.updateLoader(loaded)
          })
        })
      }
    },
    storeBackground: function (data) {
      let splitUrl = data.split('/')
      splitUrl[5] = '1000x1000'
      return splitUrl.join('/')
    },
    updateLoader: function (loaded) {
      if (loaded !== 3) {
        document.querySelector('.main-carousel').classList.remove('show')
      } else if (loaded === 3) {
        this.elements.loader.classList.add('hidden')
        document.querySelector('.main-carousel').classList.add('show')
      }
    }
  }
  const helper = {
    randomize: function (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min) // number between min and max
    },
    emptyElement: function (element) { // empty an html element
      while (element.firstChild) {
        element.removeChild(element.firstChild)
      }
    },
    replaceHTML: function (element, string) { // empty html and insert new value
      this.emptyElement(element)
      element.insertAdjacentHTML('beforeend', string)
    },
    checkImg: function (imageUrl, callBack) {
      var imageData = new Image()
      imageData.onload = function () {
        callBack(true)
      }
      imageData.onerror = function (e) {
        e.preventDefault()
        callBack(false)
      }
      imageData.src = imageUrl
    }
  }
  app.init()
})()
