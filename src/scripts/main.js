(() => {
  const app = {
    elements: {
      radioBtns: document.querySelectorAll('input[type="radio"]')
    },
    init: function () {
      api.init()
      this.handleEvents()
    },
    handleEvents: function () {
      this.elements.radioBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          api.currentBuilding = Number(btn.value)
          api.init()
        })
      })
    },
    createPoster: function (title, date, url) {
      let el = `
      <article>
        <h1>${title}</h1>
        <h2>${date}</h2>
        <img src="${url}">
      </article>
      `
      return el
    },
    render: function (data) {
      data.forEach((item) => {
        document.body.insertAdjacentHTML('beforeend', this.createPoster(item.title.value, item.date.value, item.img.value))
      })
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
      },
      {
        name: 'Nog ergens',
        address: 'Weteringschans 6',
        dateRange: [
          ['1968-05-23T10:20:13+05:30', '1972-05-23T10:20:13+05:30'],
          ['1972-05-23T10:20:13+05:30', '1975-05-23T10:20:13+05:30'],
          ['1975-05-23T10:20:13+05:30', '1980-05-23T10:20:13+05:30'],
          ['1980-05-23T10:20:13+05:30', '1990-05-23T10:20:13+05:30'],
          ['1990-05-23T10:20:13+05:30', '2100-05-23T10:20:13+05:30']
        ]
      }
    ],
    currentBuilding: 0,
    init: function () {
      this.handleData()
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
            FILTER (?date > "${this.buildings[this.currentBuilding].dateRange[0][0]}"^^xsd:dateTime && ?date < "${this.buildings[this.currentBuilding].dateRange[0][1]}"^^xsd:dateTime)
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
            FILTER (?date > "${this.buildings[this.currentBuilding].dateRange[0][0]}"^^xsd:dateTime && ?date < "${this.buildings[this.currentBuilding].dateRange[0][1]}"^^xsd:dateTime)
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
        // console.log(`data_poster: ${usefulData}`)
        window.localStorage.setItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_posters`, JSON.stringify(usefulData))
        loaded++
        this.updateLoader(loaded)
      })
      if (window.localStorage.getItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_count`)) {
        limit = JSON.parse(window.localStorage.getItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_count`))
        console.log(limit)
        let randomNum = helper.randomize(1, limit) - 1
        console.log(`max: ${limit}`, `Number: ${randomNum}`)
        this.getData(this.generateUrl('background', randomNum)).then((result) => {
          let oldUrl = JSON.parse(result).results.bindings[0].img.value
          let newUrl = this.storeBackground(oldUrl)
          window.localStorage.setItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_background-${randomNum}`, JSON.stringify(newUrl))
          loaded = loaded + 2
          this.updateLoader(loaded)
        })
      } else {
        this.getData(this.generateUrl('count')).then((result) => {
          limit = JSON.parse(result).results.bindings[0].count.value
          window.localStorage.setItem(`${this.buildings[this.currentBuilding].name.toLowerCase()}_count`, JSON.stringify(limit))
          console.log(`max: ${limit}`)
          loaded++
          this.updateLoader(loaded)
        }).then(() => {
          this.getData(this.generateUrl('background', helper.randomize(1, limit) - 1)).then((result) => {
            console.log(`newRandom`)
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
      if (loaded === 3) {
        this.elements.loader.classList.add('hidden')
      }
    }
  }
  const helper = {
    randomize: function (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min) // number between min and max
    }
  }
  app.init()
})()
