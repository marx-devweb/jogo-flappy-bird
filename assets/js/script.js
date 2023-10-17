//FUNÇÃO PARA CRIAR NOVOS ELEMENTOS.
//Está função recebe o nome da tag que será criada e o nome da classe que será aplicada a este elemento.
function newElement(tagName, className) {
    const elem = document.createElement(tagName) //cria o elemento a partir da tag informada.
    elem.className = className //aplica a classe
    return elem //retorna o elemento
} 


//FUNÇÃO CONSTRUTORA PARA CRIAR O OBSTÁCULO.
//Esta função será responável em criar o corpo e a borda dos obstáculos.
/*Vamos passar como parâmetro para esta função o método 'reversa', que será responsavel em verificar 
qual elemento será adicionado primeiro, se é o corpo ou a borda.*/
function WrapperObstaculo(reversa = false) {
    //Definindo um novo elemento div com a class 'wrapper-obstaculo'.
    this.elemento = newElement('div', 'wrapper-obstaculo') 

    //Definindo os elementos div com a class 'bordaObstaculo' e 'corpoObstaculo'.
    const bordaObstaculo = newElement('div', 'bordaObstaculo') //definindo a borda do obstaculo.
    const corpoObstaculo = newElement('div', 'corpoObstaculo') //definindo o corpo do obstaculo.

    //Vamos utilizar o método appendChild para adicionar o corpo e a borda no elemento.
    //Vamos utilizar o operador condicional ternário para definir qual será acionado primeiro.
    this.elemento.appendChild(reversa ? corpoObstaculo : bordaObstaculo) //adiciona primeiro o corpo e depois a borda, será uma barreira superior.
    this.elemento.appendChild(reversa ? bordaObstaculo : corpoObstaculo) //adiciona primeiro a borda e depois o corpo, será uma barreira inferior.
 
    //Função para alterar a altura do corpo do obstáculo.
    this.setAltura = altura => corpoObstaculo.style.height = `${altura}px`
}

//FUNÇÃO CONSTRUTORA PARA CRIAR O CONJUNTO DE OBSTÁCULOS.
//Esta função é responsável em criar um conjunto com o obstáculo superior e o inferior.
//Vamos passar como parâmetro para esta função os métodos 'altura', abertura' e 'x'
function ConjuntoObstaculos(alturaObstaculo, aberturaObstaculo, x) {
    this.elemento = newElement('div', 'conjunto-obstaculos')
    
    this.obstaculoSuperior = new WrapperObstaculo(true)
    this.obstaculoInferior = new WrapperObstaculo(false)
    
    this.elemento.appendChild(this.obstaculoSuperior.elemento)
    this.elemento.appendChild(this.obstaculoInferior.elemento)
    
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (alturaObstaculo - aberturaObstaculo)
        const alturaInferior = alturaObstaculo - aberturaObstaculo - alturaSuperior
        this.obstaculoSuperior.setAltura(alturaSuperior)
        this.obstaculoInferior.setAltura(alturaInferior)
    }
    
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth
    
    this.sortearAbertura()
    this.setX(x)
}


function Obstaculos (alturaObstaculo, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ConjuntoObstaculos(alturaObstaculo, abertura, largura),
        new ConjuntoObstaculos(alturaObstaculo, abertura, largura + espaco),
        new ConjuntoObstaculos(alturaObstaculo, abertura, largura + espaco * 2),
        new ConjuntoObstaculos(alturaObstaculo, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if(par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio 
                && par.getX() < meio
            if(cruzouMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false
    this.elemento = newElement('img', 'passaro')
    this.elemento.src = 'assets/img/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 5 : - 5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = newElement('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }

    this.atualizarPontos(0)
}

function sobrePostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    return horizontal && vertical
}

function colisao(passaro, obstaculos) {
    let colisao = false
    obstaculos.pares.forEach(ConjuntoObstaculos => {
        if (!colisao) {
            const superior = ConjuntoObstaculos.obstaculoSuperior.elemento
            const inferior = ConjuntoObstaculos.obstaculoInferior.elemento
            colisao = sobrePostos(passaro.elemento, superior) 
                || sobrePostos(passaro.elemento, inferior)
        } 
    })
    return colisao
}

function FlappyBird() {
    let pontos = 0

    const areaJogo = document.querySelector('[container-flappy]')
    const altura = areaJogo.clientHeight
    const largura = areaJogo.clientWidth

    const progresso = new Progresso()
    const obstaculos = new Obstaculos(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaJogo.appendChild(progresso.elemento)
    areaJogo.appendChild(passaro.elemento)
    obstaculos.pares.forEach(par => areaJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            obstaculos.animar()
            passaro.animar()

            if(colisao(passaro, obstaculos)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()