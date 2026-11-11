// Crear la mazmorra: cuadrícula, salas, pasillos, trampas y mapa de mosaicos.

function vaciarCuadricula () {
    // Solo se crea la lista la primera vez; después se rellena de ceros. Crear una lista NUEVA en cada piso obligaría a
    // copiar la cuadrícula varias veces mientras se llena, y eso deja basura en la memoria, en cada intento del bucle
    // de construirPiso y en sitios distintos de la memoria.
    if (cuadricula.length != CUADRICULA_ANCHO * CUADRICULA_ALTO) {
        cuadricula = []
        for (let indice = 0; indice < CUADRICULA_ANCHO * CUADRICULA_ALTO; indice++) {
            cuadricula.push(0)
        }
        return
    }
    for (let indice = 0; indice < CUADRICULA_ANCHO * CUADRICULA_ALTO; indice++) {
        cuadricula[indice] = 0
    }
}

function cavar (x: number, y: number) {
    if (x > 0 && x < CUADRICULA_ANCHO - 1 && y > 0 && y < CUADRICULA_ALTO - 1) {
        cuadricula[y * CUADRICULA_ANCHO + x] = 1
    }
}

// Los pasillos miden DOS mosaicos de ancho. Con uno solo, el pasillo mediría justo 16 píxeles y el héroe mide 16
// píxeles de alto: cabría, pero solo si estuviera colocado al píxel, y cada giro se atascaría. Esto es importante desde
// que las paredes son de verdad sólidas (mira construirMosaicos). Dos mosaicos dejan 16 píxeles de holgura.
function cavarPasillo (x1: number, y1: number, x2: number, y2: number) {
    x = x1
    y = y1
    while (x != x2) {
        cavar(x, y)
        cavar(x, y + 1)
        if (x < x2) {
            x += 1
        } else {
            x += -1
        }
    }
    while (y != y2) {
        cavar(x, y)
        cavar(x + 1, y)
        if (y < y2) {
            y += 1
        } else {
            y += -1
        }
    }
    cavar(x, y)
    cavar(x + 1, y)
    cavar(x, y + 1)
    cavar(x + 1, y + 1)
}

function crearSalas () {
    let anchoSala: number;
let altoSala: number;
let inicioX: number;
let inicioY: number;
let centroX: number;
let centroY: number;
let libre: boolean;
salaX = []
    salaY = []
    for (let intento = 0; intento < 50; intento++) {
        anchoSala = randint(3, 7)
        altoSala = randint(3, 5)
        inicioX = randint(1, CUADRICULA_ANCHO - anchoSala - 2)
        inicioY = randint(1, CUADRICULA_ALTO - altoSala - 2)
        centroX = inicioX + Math.idiv(anchoSala, 2)
        centroY = inicioY + Math.idiv(altoSala, 2)
        libre = true
        for (let otra = 0; otra <= salaX.length - 1; otra++) {
            if (valorAbsoluto(salaX[otra] - centroX) < 6 && valorAbsoluto(salaY[otra] - centroY) < 5) {
                libre = false
            }
        }
        if (libre) {
            for (let y2 = 0; y2 <= altoSala - 1; y2++) {
                for (let x2 = 0; x2 <= anchoSala - 1; x2++) {
                    cavar(inicioX + x2, inicioY + y2)
                }
            }
            if (salaX.length > 0) {
                cavarPasillo(salaX[salaX.length - 1],
                    salaY[salaY.length - 1], centroX, centroY)
            }
            salaX.push(centroX)
            salaY.push(centroY)
        }
    }
}

function colocarTrampas () {
    let x3: number;
    let y3: number;
    let lejosDelInicio: any;
    // colocadas, intentos y cantidad son variables de la propia función. Si fueran globales, se quedarían con el valor
    // del piso anterior y casi no se pondrían trampas.
    let colocadas = 0
    let intentos = 0
    // Una trampa más cada PISOS_POR_TRAMPA pisos, para que el piso 5 no esté ya lleno de pinchos.
    let cantidad = 1 + Math.idiv(piso, PISOS_POR_TRAMPA)
    if (cantidad > TRAMPAS_MAX) {
        cantidad = TRAMPAS_MAX
    }
    while (colocadas < cantidad && intentos < 300) {
        intentos += 1
        x3 = randint(1, CUADRICULA_ANCHO - 2)
        y3 = randint(1, CUADRICULA_ALTO - 2)
        lejosDelInicio = valorAbsoluto(x3 - salaX[0]) > 2 || valorAbsoluto(y3 - salaY[0]) > 2
        if (cuadricula[y3 * CUADRICULA_ANCHO + x3] == 1 && lejosDelInicio) {
            cuadricula[y3 * CUADRICULA_ANCHO + x3] = 3
            colocadas += 1
        }
    }
}

function construirMosaicos () {
    let contenido: number;
let numeroMosaico: number;
let bufferMosaicos = Buffer.create(4 + CUADRICULA_ANCHO * CUADRICULA_ALTO)
bufferMosaicos[0] = CUADRICULA_ANCHO
    bufferMosaicos[2] = CUADRICULA_ALTO
    capaParedes = image.create(CUADRICULA_ANCHO, CUADRICULA_ALTO)
    for (let y4 = 0; y4 <= CUADRICULA_ALTO - 1; y4++) {
        for (let x4 = 0; x4 <= CUADRICULA_ANCHO - 1; x4++) {
            contenido = cuadricula[y4 * CUADRICULA_ANCHO + x4]
            numeroMosaico = 0
            if (contenido == 0) {
                // El valor TIENE que ser 2. El motor de mosaicos compara exactamente con TM_WALL, que vale 2: es una
                // comparación exacta, no una prueba de «distinto de cero». Con un 1 ninguna pared sería sólida: las
                // bolas de fuego las atravesarían, los enemigos pasarían por los muros y nunca notarían que
                // se han atascado.
                capaParedes.setPixel(x4, y4, 2)
                if (esSuelo(x4, y4 + 1)) {
                    numeroMosaico = 6
                } else if (esSuelo(x4 - 1, y4) || esSuelo(x4 + 1, y4) || esSuelo(x4, y4 - 1)) {
                    numeroMosaico = 5
                } else {
                    numeroMosaico = 0
                }
            } else if (contenido == 2) {
                numeroMosaico = 7
            } else if (contenido == 3) {
                numeroMosaico = 8
            } else {
                numeroMosaico = randint(1, 3)
            }
            bufferMosaicos[4 + y4 * CUADRICULA_ANCHO + x4] = numeroMosaico
        }
    }
    tiles.setCurrentTilemap(tiles.createTilemap(bufferMosaicos, capaParedes,
        [MOSAICO_ROCA, MOSAICO_SUELO, MOSAICO_SUELO_2, MOSAICO_SUELO_3, MOSAICO_SUELO,
            MOSAICO_PARED, MOSAICO_PARED_BASE, MOSAICO_ESCALERA, MOSAICO_PINCHOS],
        TileScale.Sixteen))
}
