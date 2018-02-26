
const screenWidth = () => window.innerWidth
const screenHeight = () => window.innerHeight

let catPos = []
let datPos = []

// state or mode
const [CATEGORY_MODE, ORGS_MODE] = ['CATEGORY_MODE', 'ORGS_MODE']

const data = []
const category = []

loadData(json => {
  json.forEach(element => {
    data.push(element)
    if (category.find(value => value.category_name === element.category) === undefined) {
      category.push({
        category_name: element.category,
        bubble_size: 0,
        frequency: 1
      })
    } else { category.find(value => value.category_name === element.category).frequency++ }
  })
  category.sort((a, b) => b.frequency - a.frequency).forEach((e, index) => {
    e.bubble_size = (screenWidth() / 3 * e.frequency / 212)

    // need a better way to randomize bubble position without
    // any overlaps between bubble
    let newPos = [
      random(-screenWidth() * 0.4, screenWidth() * 0.4),
      random(-screenHeight() * 0.4, screenHeight() * 0.4)
    ]

    if (index > 0) {
      for (let j = index - 1; j >= 0; j--) {
        while (dist(...newPos, ...catPos[j]) < 2 * category[j].bubble_size) {
          newPos = [
            random(-screenWidth() * 0.4, screenWidth() * 0.4),
            random(-screenHeight() * 0.4, screenHeight() * 0.4)
          ]
        }
      }
    }

    catPos.push(newPos)
  })
})

let rot = 0
let trig = [false, 0]
let currState = CATEGORY_MODE
let selectedCategory = category[0]
let node = []

const view = [
  screenWidth() / 2,
  screenHeight() / 2
]

const getcoord = (x, y) => [x - screenWidth() / 2, y - screenHeight() / 2]

const getMouse = () => getcoord(mouseX, mouseY)

function setup () {
  createCanvas(screenWidth(), screenHeight())
  stroke(0) // Set line drawing color to white
  frameRate(30)
  angleMode(DEGREES)
  $('#container').hide()
}

const colorsTable = (data) => {
  let colors = []
  data.forEach((d, index) => {
    colors.push([255 - index * 20, 0 + index * 30, 43 + index * 40])
  })
  return colors
}

function draw () {
  background('#eee')
  translate(...view)
  switch (currState) {
    case CATEGORY_MODE:

      category.forEach((c, index) => {
        push()
        fill(...colorsTable(data)[index])
        stroke('#333')
        const size = c.bubble_size * (1 + (sin(rot) * 0.5)) + 20
        ellipse(
          ...catPos[index],
          size,
          size
        )
        pop()
      })

      rot = (rot + 0.5) % 180

      push()
      textSize(32)
      stroke(0)
      fill('#a463ff')
      text(
        'Select a Category', -(8 * 19),
        0
      ) // how to centering text ?
      pop()
      break

    case ORGS_MODE:

      node.forEach((n, index) => {
        push()
        fill(...colorsTable(data)[category.indexOf(category.find(e => e.category_name === selectedCategory.category_name))])
        ellipse(...datPos[index], 10, 10)
        pop()
      })

      break

    default:
      break
  }

  drawDesc(...trig)

  $('#quit-btn').click(() => {
    $('#container').slideUp()
  })
}

function mouseClicked () {
  let mousePos = getcoord(mouseX, mouseY)

  switch (currState) {
    case CATEGORY_MODE:
      for (let index = 0; index < category.length; index++) {
        if (dist(...mousePos, ...catPos[index]) <= category[index].bubble_size * (1 + (sin(rot) * 0.2))) {
          selectedCategory = category[index]
          currState = ORGS_MODE
          data.forEach(e => {
            if (e.category === selectedCategory.category_name) {
              let tmp = [
                random(-screenWidth() * 0.4, screenWidth() * 0.4),
                random(-screenHeight() * 0.4, screenHeight() * 0.4)
              ]

              datPos.push(tmp)
              node.push(e)
            }
          })
          trig = [false, 0]
          break
        }
      }
      break

    case ORGS_MODE:
      let changeState = true
      for (let index = 0; index < datPos.length; index++) {
        if (dist(...mousePos, ...datPos[index]) <= 10) {
          document.getElementById('title').innerHTML = node[index].name
          document.getElementById('desc').innerHTML = node[index].tagline
          document.getElementById('web').setAttribute('href', `https://soc-orgs.netlify.com/orgs/${node[index].name.split(' ').join('-')}`)
          $('#container').slideDown()
          changeState = false
          break
        }
      }
      if (changeState) {
        trig = [false, 0]
        currState = CATEGORY_MODE
        node = []
        datPos = []
      }
      break
  }
}

function mouseMoved () {
  switch (currState) {
    case CATEGORY_MODE:
      for (let index = 0; index < category.length; index++) {
        if (dist(...getMouse(), ...catPos[index]) <= category[index].bubble_size * (1 + (sin(rot) * 0.2))) {
          trig = [true, index]
          break
        } else { trig = [false, 0] }
      }
      break

    case ORGS_MODE:
      for (let index = 0; index < datPos.length; index++) {
        if (dist(...getMouse(), ...datPos[index]) <= 20) {
          trig = [true, index]
          break
        } else { trig = [false, 0] }
      }
      break

    default:
      break
  }
}

const drawDesc = (trigger, idx) => {
  if (trigger) {
    push()
    let y2 = getMouse()[1] + 20
    let x2 = getMouse()[0] + 20
    line(x2, y2, x2 + 100, y2)
    pop()

    push()
    stroke(0)

    switch (currState) {
      case CATEGORY_MODE:
        line(...catPos[idx], x2, y2)
        pop()

        push()
        textSize(12)
        noStroke()
        text(category[idx]
          .category_name
          .replace('_', ' ')
          .replace('_', ' '),
        x2, y2 + 10)
        text(category[idx].frequency + ' organizations', x2, y2 + 24)
        break

      case ORGS_MODE:
        line(...datPos[idx], x2, y2)
        pop()

        push()
        textSize(12)
        noStroke()
        text(node[idx].name,
          x2, y2 + 10)
        break

      default:
        break
    }
    pop()
  }
}
