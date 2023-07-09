
const WOLF = "w";
const RABBIT = "r";
const HOME = "h";
const FENCE = "f";
const WOLF_PERCENT = 60
const FENCE_PERCENT = 40
const imagesHeroes = {
    rabbit: "./images/rabbit.jpg",
    wolf: "./images/wolf.jpg",
    home: "./images/home.jpg",
    fence: "./images/fence.jpg"
}

const gameState = {}


const getElementById = (id) => document.getElementById(id)

const createElement = (id) => document.createElement(id)


const insertHero = (matrix, heroName) => {
    const x = parseInt(Math.random() * (matrix.length))
    const y = parseInt(Math.random() * (matrix.length))
    if (matrix[x][y] === 0) {
        matrix[x][y] = heroName
    } else {
        return insertHero(matrix, heroName)
    }
    return matrix
}



const calculatePercent = (number, percent) => (number * percent) / 100;





const insertSingleHero = (matrix, heroName, percent = 1) => {
    if (heroName === WOLF || heroName === FENCE) {
        percent = calculatePercent(matrix.length, percent)
    }
    for (let i = 0; i < percent; i++) {
        insertHero(matrix, heroName)
    }
    return matrix
}





const inserAllHeroes = (matrix) => {
    insertSingleHero(matrix, WOLF, WOLF_PERCENT)
    insertSingleHero(matrix, FENCE, FENCE_PERCENT)
    insertSingleHero(matrix, RABBIT)
    insertSingleHero(matrix, HOME)
}





const getHeroCoords = (matrix, hero) => {
    const findCords = (acc, val, x) => {
        val.forEach((elm, y) => {
            if (elm === hero) {
                acc.push([x, y])
            }
        })
        return acc
    }
    return matrix.reduce(findCords, [])
}





const rabbitDirection = (direction, matrix, tiv) => {
    const [x, y] = getHeroCoords(matrix, RABBIT).flat()
    if (direction === `right${tiv}`) {
        return [x, y + 1]
    } else if (direction === `left${tiv}`) {
        return [x, y - 1]
    } else if (direction === `up${tiv}`) {
        return [x - 1, y]
    } else if (direction === `down${tiv}`) {
        return [x + 1, y]
    }
    console.log(direction)
}





const teleport = (matrix, [x, y]) => {
    const maxValue = matrix.length
    x = (x + maxValue) % maxValue
    y = (y + maxValue) % maxValue
    return [x, y]
}





const stepsCordsRabbit = (gameState, [nextStepsRabbitCordsX, nextStepsRabbitCordsY], tiv) => {
    const matrix = gameState[tiv].matrix
    const [initialRabbitX, initialRabbitY] = getHeroCoords(matrix, RABBIT).flat()
    const [rabbitCordsX, rabbitCordsY] = teleport(matrix, [nextStepsRabbitCordsX, nextStepsRabbitCordsY])
    if (matrix[rabbitCordsX][rabbitCordsY] === 0) {
        matrix[rabbitCordsX][rabbitCordsY] = RABBIT
        matrix[initialRabbitX][initialRabbitY] = 0
    }
    if (matrix[rabbitCordsX][rabbitCordsY] === HOME) {
        gameState[tiv].gameRunning = false
        gameState[tiv].message = "YOU WIN"
        buttonsOnclick(null, tiv)
    }
    return gameState
}





const calculateDistance = ([rabbitX, rabbitY], [wolfX, wolfY]) =>
    Math.sqrt(Math.abs(Math.pow((rabbitX - wolfX), 2)) + Math.abs(Math.pow((rabbitY - wolfY), 2)))




const getNearestCell = ([rabbitX, rabbitY], wolvesNeighboringCoords) => {
    if (wolvesNeighboringCoords.length === 0) {
        return []
    }
    const distances = wolvesNeighboringCoords.map(cell => calculateDistance([rabbitX, rabbitY], cell))
    const nearestIndex = minDistanceWolfsIndex(distances)
    return wolvesNeighboringCoords[nearestIndex]
}





const possibleMoveWolfs = (gameState) => {
    const matrix = gameState.matrix
    return getHeroCoords(matrix, WOLF).map(val => neighboringCordsWolf(matrix, val))
}





const checkCells = (gameState, coords, tiv) => coords.filter(([x, y]) => {
    const matrix = gameState[tiv].matrix
    if (matrix[x][y] === RABBIT) {
        gameState[tiv].gameRunning = false,
            gameState[tiv].message = "GAME OVER"
        buttonsOnclick(null, tiv)
        return gameState
    }
    return matrix[x][y] === 0
})






const moveHero = (matrix, [fromX, fromY], to) => {
    if (to.length === 0) {
        return
    }
    const [toX, toY] = to
    matrix[fromX][fromY] = 0
    matrix[toX][toY] = WOLF
}





const minDistanceWolfsIndex = (distanceWolf) =>
    distanceWolf.indexOf(Math.min(...distanceWolf))

const range = (matrix, [x, y]) => x >= 0 && x < matrix.length && y >= 0 && y < matrix.length

const neighboringCordsWolf = (matrix, [x, y]) => {
    const cells = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
    ]
    return cells.filter(cell => range(matrix, cell))
}



const moveWolves = (gameState, tiv) => {
    if (!gameState[tiv].gameRunning) {
        createMessage(gameState, gameState[tiv].matrix, tiv)
        return gameState
    }
    const matrix = gameState[tiv].matrix
    const rebbitCoords = getHeroCoords(matrix, RABBIT)[0]
    const wolvesCoords = getHeroCoords(matrix, WOLF)
    wolvesCoords.map(singleWolf => {
        const possibleMoves = neighboringCordsWolf(matrix, singleWolf)
        const isEmptyCellOrRabbit = checkCells(gameState, possibleMoves, tiv)
        const nearestCell = getNearestCell(rebbitCoords, isEmptyCellOrRabbit)
        moveHero(matrix, singleWolf, nearestCell)
    })
}




const eventMove = (event, gameState, tiv) => {
    clearGameBoard(tiv)
    const id = `${event.target.id}`
    const coords = rabbitDirection(id, gameState[tiv].matrix, tiv)
    if (coords === undefined) {
        return
    }
    const newGameState = stepsCordsRabbit(gameState, coords, tiv)
    moveWolves(newGameState, tiv)
    createGameBoard(newGameState[tiv].matrix, tiv)
    if (!gameState[tiv].gameRunning) {
        createMessage(gameState, gameState[tiv].message, tiv)
        return gameState
    }
}


const buttonsOnclick = (func, tiv) => {
    const buttons = document.getElementById(`buttons${tiv}`)
    const buttonsDirections = buttons.querySelectorAll("button")
    buttonsDirections.forEach(button => {
        button.onclick = func
    })
}



const moveRabbit = (gameState, tiv) => {
    buttonsOnclick((event) => eventMove(event, gameState, tiv), tiv)
}



const createMatrix = (matrixSize) => new Array(matrixSize)
    .fill(0)
    .map(matrixElm => matrixElm = new Array(matrixSize)
        .fill(0))



const createDiv = (hero) => {
    const container = createElement("div")
    container.style = `
     width:60px;
     height:60px;
     background:#B7E48B;
     border: 1px solid grey;
     border-radius:5px

        `
    if (hero === RABBIT) {
        container.append(createImage(imagesHeroes.rabbit))
    }
    if (hero === WOLF) {
        container.append(createImage(imagesHeroes.wolf))
    }
    if (hero === HOME) {
        container.append(createImage(imagesHeroes.home))
    }
    if (hero === FENCE) {
        container.append(createImage(imagesHeroes.fence))
    }
    return container
}




const createImage = (srcImage) => {
    const source = createElement("img")
    source.style = `
   width:60px;
   height:60px;
   `
    source.src = srcImage
    return source
}




const containerDiv = (matrixSize) => {
    const container = createElement("div")
    container.style = `
     width:${parseInt(matrixSize) * 60 + parseInt(matrixSize) * 4}px;
     display:flex;
     flex-wrap:wrap;
     box-sizing: border-box;
  
    `
    return container
}




const createGameBoard = (matrix, tiv) => {
    const matrixSize = matrix.length
    const container = containerDiv(matrixSize)
    const root = getElementById(`root${tiv}`)
    root.style.display = "block"
    root.append(container)
    matrix.forEach((arr) => arr.forEach(
        (cell) => {
            container.append(createDiv(cell))
        }
    ))

    return root
}




const clearGameBoard = (tiv) => {
    const root = getElementById(`root${tiv}`)
    root.innerHTML = ""
}



const newGameStart = (gameState, tiv) => {
    const button = getElementById(`gameStart${tiv}`)
    button.addEventListener("click", () => gameStart(gameState, tiv))
}




const createMessage = (gameState, text, tiv) => {
    const root = getElementById(`root${tiv}`)
    const messageDiv = getElementById(`message${tiv}`)
    messageDiv.innerHTML = ""
    const message = document.createElement("h1")
    message.innerHTML = text
    if (!gameState[tiv].gameRunning) {
        root.style.display = "none"
        messageDiv.style.display = "block"
        if (text === "GAME OVER") {
            message.style = `
        font-size:60px;
        text-align:center;
        color:red
        `} else {
            message.style = `
            font-size:60px;
            text-align:center;
            color:green
            `
        }
        messageDiv.append(message)
        newGameStart(gameState, tiv)
    }
}




const gameStart = (gameState, tiv) => {
    const cloneButtonsDirections = getElementById(`buttons${tiv}`)
    cloneButtonsDirections.style.display = "block"

    const messageDiv = getElementById(`message${tiv}`)
    messageDiv.style.display = "none"

    const select = getElementById(`selectStart${tiv}`)
    const selectVal = parseInt(select.value)
    gameState[tiv].gameRunning = true
    gameState[tiv].matrix = createMatrix(selectVal)

    clearGameBoard(tiv)
    inserAllHeroes(gameState[tiv].matrix)
    moveRabbit(gameState, tiv)
    createGameBoard(gameState[tiv].matrix, tiv)
}

let tiv = 0

const createNewMatrixButton = getElementById("createNewMatrixButton")

createNewMatrixButton.onclick = function () {
    tiv++
    gameState[tiv] = {
        gameRunning: "",
        matrix: [],
        message: ""
    }
    createCloneGameBoard(tiv)
}


const newElemenet = (id, newId, boolean) => {
    const elem = getElementById(id)
    const newElem = cloneElement(elem, boolean)
    newElem.id = `${elem.id}${newId}`
    return newElem
}



const cloneElement = (el, innerEl) => el.cloneNode(innerEl)



const clearCloneGameBoard = (id,gameState) => {
        const gameBoard = getElementById("gameBoard")
        const gameBoardsClone = getElementById(`gameBoardsClone${id}`)
        gameBoardsClone.remove()
        for(let key in gameState){
            if(key === `${id}`){
              delete gameState[id]
            }
        }
    }



const createCloneGameBoard = (tiv) => {
    const mainGameBoard = getElementById("gameBoards")

    const gameBoardsClone = newElemenet("gameBoardsClone", tiv, false)
    const cloneMessage = newElemenet("message", tiv, true)
    const cloneRoot = newElemenet("root", tiv, true)
    const cloneGameStartButton = newElemenet("gameStart", tiv, true)
    const cloneSelectStart = newElemenet("selectStart", tiv, true)
    const cloneClearButton = newElemenet("clear", tiv, true)
    const cloneOpenGame = newElemenet("openGame", tiv, false)
    const cloneButtonsDirections = newElemenet("buttons", tiv, false)

    cloneOpenGame.append(cloneGameStartButton)
    cloneOpenGame.append(cloneSelectStart)

    gameBoardsClone.append(cloneOpenGame)
    gameBoardsClone.append(cloneRoot)
    gameBoardsClone.append(cloneMessage)
    gameBoardsClone.append(cloneClearButton)

    const buttons = document.getElementById("buttons")
    const buttonsDirections = buttons.querySelectorAll("button")
    buttonsDirections.forEach(button => {
        const buttonClone = newElemenet(button.id, tiv, true)
        cloneButtonsDirections.append(buttonClone)
    })
    cloneButtonsDirections.style.display = "none"
    gameBoardsClone.append(cloneButtonsDirections)

    mainGameBoard.append(gameBoardsClone)


    cloneClearButton.onclick = () =>clearCloneGameBoard(tiv,gameState)
    cloneGameStartButton.addEventListener("click", () => gameStart(gameState, tiv))
}




