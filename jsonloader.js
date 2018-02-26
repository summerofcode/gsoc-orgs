const loadJSON = (callback) => {
  let xobj = new XMLHttpRequest()
  xobj.overrideMimeType('application/json')
  xobj.open('GET', './_data/orgs.json', true)
  xobj.onreadystatechange = () => {
    if (xobj.readyState === 4 && xobj.status === 200) {
      // .open will NOT return a value but simply returns undefined in async mode so use a callback
      callback(xobj.responseText)
    }
  }
  xobj.send(null)
}

/* global loadData */
const loadData = cb => {
  loadJSON(response => {
    let json = JSON.parse(response)
    cb(json)
  })
}
