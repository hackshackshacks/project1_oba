// music posters van het IISG met Paradiso in de title met datum
const currentBuilding = {
  name: 'Paradiso',
  address: 'Weteringschans 6',
  dateRange: [
    ['1968-05-23T10:20:13+05:30', '1972-05-23T10:20:13+05:30'],
    ['1972-05-23T10:20:13+05:30', '1975-05-23T10:20:13+05:30'],
    ['1975-05-23T10:20:13+05:30', '1980-05-23T10:20:13+05:30'],
    ['1980-05-23T10:20:13+05:30', '1990-05-23T10:20:13+05:30'],
    ['1990-05-23T10:20:13+05:30', '2100-05-23T10:20:13+05:30']
  ]
}
let randomNum = 1
const posterQuery = `
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
  SELECT ?poster ?title ?img ?date WHERE {
    ?poster dc:type "Poster."^^xsd:string .
    ?poster dc:title ?title .
    ?poster dc:subject "Music."^^xsd:string .
    ?poster foaf:depiction ?img .
    FILTER REGEX(?title, "${currentBuilding.name}") .
    ?poster sem:hasBeginTimeStamp ?date .
  }
  ORDER BY ?date
`
const countQuery = `
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
  SELECT count(*) as ?count WHERE {
    ?photo dc:type "foto"^^xsd:string .
    ?photo dc:title ?title .
    ?photo foaf:depiction ?img .
    FILTER REGEX(?title, "${currentBuilding.name}") .
    ?photo sem:hasBeginTimeStamp ?date .
    FILTER (?date > "${currentBuilding.dateRange[0][0]}"^^xsd:dateTime && ?date < "${currentBuilding.dateRange[0][1]}"^^xsd:dateTime)
  }
`
const loader = document.querySelector('#loader-wrapper')
const encodedPoster = encodeURIComponent(posterQuery)
const encodedCount = encodeURIComponent(countQuery)

const posterUrl = `https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=${encodedPoster}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`

const countUrl = `https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=${encodedCount}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`

function generateUrl () {
  const photoQuery = `
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>

  SELECT ?photo ?title ?img ?date WHERE {
    ?photo dc:type "foto"^^xsd:string .
    ?photo dc:title ?title .
    ?photo foaf:depiction ?img .
    FILTER REGEX(?title, "${currentBuilding.address}") .
    ?photo sem:hasBeginTimeStamp ?date .
    FILTER (?date > "${currentBuilding.dateRange[0][0]}"^^xsd:dateTime && ?date < "${currentBuilding.dateRange[0][1]}"^^xsd:dateTime)
  }
  ORDER BY ?date OFFSET ${randomNum} LIMIT 1
`
  const encodedPhoto = encodeURIComponent(photoQuery)
  return `https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=${encodedPhoto}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`
}
function getData (url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('get', url)
    xhr.onload = () => resolve(xhr.responseText)
    xhr.onerror = () => reject(xhr.statusText)
    xhr.send()
  })
}

getData(posterUrl).then((result) => {
  let data = JSON.parse(result).results.bindings
  data.forEach((item) => {
    document.body.insertAdjacentHTML('beforeend', createPoster(item.title.value, item.date.value, item.img.value))
  })
  loader.classList.add('hidden')
})

getData(countUrl).then((result) => {
  let data = JSON.parse(result)
  randomNum = randomize(0, data.results.bindings[0].count.value - 2)
}).then(() => {
  getData(generateUrl()).then((result) => {
    let data = JSON.parse(result).results.bindings
    let url = data[0].img.value.split('/')
    url[5] = '1000x1000'
    let newUrl = url.join('/')

    document.querySelector('.background').style.backgroundImage = `url("${newUrl}")`
  })
})

function randomize (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) // number between min and max
}
function createPoster (title, date, url) {
  let el = `
  <article>
    <h1>${title}</h1>
    <h2>${date}</h2>
    <img src="${url}">
  </article>
  `
  return el
}
