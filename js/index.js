function newElement(tagName, className){
   const element = document.createElement(tagName)
   element.className = className
   return element
}

function Barrier(resevation = false){
    this.element = newElement('div','barrier')

    const edge = newElement('div', 'edge')
    const body = newElement('div', 'body')

    this.element.appendChild(resevation ? body : edge)
    this.element.appendChild(resevation ? edge : body)

    this.setHeigth = heigth => body.style.height = `${heigth}px`
}

function PairBarriers(heigth, opening, x){
    this.element = newElement('div', 'pair-of-barriers')

    this.top = new Barrier(true)
    this.bottom = new Barrier(false)

    this.element.appendChild(this.top.element)
    this.element.appendChild(this.bottom.element)

    this.sortOpening = () => {
        const heigthTop = Math.random() * (heigth - opening)
        const heigthBottom = heigth - opening - heigthTop

        this.top.setHeigth(heigthTop)
        this.bottom.setHeigth(heigthBottom)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.sortOpening()
    this.setX(x)
}

function Barriers(heigth, width, opening, space, notifyPoint) {
    this.pairs = [
        new PairBarriers(heigth, opening, width),
        new PairBarriers(heigth, opening, width + space),
        new PairBarriers(heigth, opening, width + space * 2),
        new PairBarriers(heigth, opening, width + space * 3)
    ]

    const displacement = 3
    this.animation = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            //quando o element sair da tela
            if (pair.getX() < -pair.getWidth()){
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.sortOpening()
            }

            const middle = width/2
            const crossedMiddle = pair.getX() + displacement >= middle  
                && pair.getX() < middle
                crossedMiddle && notifyPoint()
        });
    }
}

function Bird(heigthGame) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'imgs/bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.touchstart =  e => flying = true
    window.touchcancel = e => flying = false
    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.animation = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const heigthMax = heigthGame - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        }else if ( newY >= heigthMax) {
            this.setY(heigthMax)
        }else{
            this.setY(newY)
        }
    }

    this.setY(heigthGame / 2)
}

function Progress(){
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

function overlaid(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left 
        && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top 
        && b.top + b.height >= a.top

    return horizontal && vertical
}

function collided(bird, barriers){
    let collided = false
    barriers.pairs.forEach(pairBarriers => {
        if(!collided) {
            const top = pairBarriers.top.element
            const bottom = pairBarriers.bottom.element
            collided = overlaid(bird.element, top)
                || overlaid(bird.element, bottom)
        }
    })
    return collided
}

function GameOver(){
    const modal = document.querySelector("#modal");
    const gameArea = document.querySelector('[sf-gameOver]')  
    const buttonResetGame = document.querySelector('[sf-gameOver] button') 
    
    buttonResetGame.addEventListener("click", () => {
        window.location.reload()
    })
    
    this.element = newElement('div', 'game-over')
    this.element.innerHTML = 'GAME OVER'

    modal.classList.remove("hide")
    gameArea.appendChild(this.element)
}

function FlappyBird(){
    let points = 0

    const gameArea = document.querySelector('[sf-flappy]')
    const heigth = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(heigth, width, 200, 400, 
        () => progress.updatePoints(++points))
    const bird = new Bird(heigth)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(par => gameArea.appendChild(par.element))
    
    this.start = () => {
        //loop do jogo
        const timer = setInterval(() => {
            barriers.animation()
            bird.animation()

            if(collided(bird, barriers)){
                clearInterval(timer)
                
                GameOver()
            }
        }, 20)
    }
        
 }

 new FlappyBird().start()