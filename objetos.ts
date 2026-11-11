// Objetos y decorado: se colocan y se recogen al cambiar de piso.

function ponerObjeto (columna: number, fila: number, clase: number) {
    let objeto: Sprite;
if (clase == 1) {
        objeto = sprites.create(IMAGEN_LLAVE, TIPO_LLAVE)
    } else if (clase == 2) {
        objeto = sprites.create(IMAGEN_CORAZON, TIPO_CORAZON)
    } else if (clase == 3) {
        objeto = sprites.create(IMAGEN_ANTORCHA, TIPO_ANTORCHA)
    } else if (clase == 4) {
        objeto = sprites.create(IMAGEN_COFRE, TIPO_COFRE)
    } else {
        objeto = sprites.create(IMAGEN_MONEDA, TIPO_MONEDA)
    }
    // Además GhostThroughTiles: los objetos solo necesitan el solape con el héroe, no los eventos de los mosaicos. Sin
    // esta marca, la física comprobaría en cada fotograma todos los mosaicos que toca cada objeto y crearía además
    // objetos de vida corta.
    objeto.setFlag(SpriteFlag.GhostThroughWalls, true)
    objeto.setFlag(SpriteFlag.GhostThroughTiles, true)
    tiles.placeOnTile(objeto, tiles.getTileLocation(columna, fila))
}

function ponerDecorado () {
    let x5: number;
let y5: number;
let adorno: Sprite;
let antorchaPared: Sprite;
for (let intento = 0; intento < 8 + salaX.length; intento++) {
        x5 = randint(1, CUADRICULA_ANCHO - 2)
        y5 = randint(1, CUADRICULA_ALTO - 2)
        if (cuadricula[y5 * CUADRICULA_ANCHO + x5] == 1) {
            if (randint(0, 1) == 0) {
                adorno = sprites.create(DECORADO_BARRIL, TIPO_DECORADO)
            } else {
                adorno = sprites.create(DECORADO_HUESOS, TIPO_DECORADO)
            }
            // Es solo decorado: ningún evento depende de él, así que lleva la marca Ghost completa, que lo saca del
            // todo de la física.
            adorno.setFlag(SpriteFlag.Ghost, true)
            adorno.z = -1
            tiles.placeOnTile(adorno, tiles.getTileLocation(x5, y5))
        }
    }
    for (let intento = 0; intento < 10; intento++) {
        x5 = randint(1, CUADRICULA_ANCHO - 2)
        y5 = randint(1, CUADRICULA_ALTO - 2)
        if (cuadricula[y5 * CUADRICULA_ANCHO + x5] == 0 && esSuelo(x5, y5 + 1)) {
            antorchaPared = sprites.create(IMAGEN_ANTORCHA, TIPO_DECORADO)
            antorchaPared.setFlag(SpriteFlag.Ghost, true)
            antorchaPared.z = -1
            tiles.placeOnTile(antorchaPared, tiles.getTileLocation(x5, y5))
            antorchaPared.y = antorchaPared.y + 3
        }
    }
}

// ¿Hay suelo en la columna muroX desde debajo del muro (fila muroY) hasta la fila de salida? Entonces el muro pertenece
// a la sala de salida.
function sueloHastaInicio (muroX: number, muroY: number) {
    for (let y = muroY + 1; y <= salaY[0]; y++) {
        if (!(esSuelo(muroX, y))) {
            return false
        }
    }
    return true
}

// Esta función pone un cuadro del Calliope Hacker en una pared de la sala de salida del piso 1: una pequeña aparición
// en un rincón, solo decorado, sin colisión (Ghost) y por debajo de la oscuridad; se ve en cuanto le da la luz del
// héroe. Busca el muro más cercano que tenga suelo debajo (una pared que se vea), por encima del punto de salida, como
// mucho seis columnas al lado y cinco filas más arriba. Pasada 0: el muro pertenece a la sala de salida (hay suelo
// hasta la fila de salida) y tiene pared a izquierda y derecha, porque el cuadro es dos píxeles más ancho que un
// mosaico. Pasada 1: sin mirar a los vecinos. Pasada 2: cualquier muro de la zona de búsqueda. Una simulación de 20 000
// pisos dio cerca del 94 % en la primera pasada y cerca del 99 % en total; si no hay sitio, el piso se
// queda sin cuadro.
function ponerCuadroPared () {
    let mejorX = -1
    let mejorY = -1
    let mejorDistanciaCuadrada = 0
    let distanciaCuadrada = 0
    for (let pasada = 0; pasada < 3 && mejorX < 0; pasada++) {
        for (let muroY = salaY[0] - 5; muroY <= salaY[0] - 1; muroY++) {
            for (let muroX = salaX[0] - 6; muroX <= salaX[0] + 6; muroX++) {
                if (muroY < 1 || muroX < 1 || muroX > CUADRICULA_ANCHO - 2 ||
                    esSuelo(muroX, muroY) || !(esSuelo(muroX, muroY + 1))) {
                    continue
                }
                if (pasada == 0 && (esSuelo(muroX - 1, muroY) || esSuelo(muroX + 1, muroY))) {
                    continue
                }
                if (pasada < 2 && !(sueloHastaInicio(muroX, muroY))) {
                    continue
                }
                distanciaCuadrada = (muroX - salaX[0]) * (muroX - salaX[0]) +
                    (muroY - salaY[0]) * (muroY - salaY[0])
                if (mejorX < 0 || distanciaCuadrada < mejorDistanciaCuadrada) {
                    mejorX = muroX
                    mejorY = muroY
                    mejorDistanciaCuadrada = distanciaCuadrada
                }
            }
        }
    }
    if (mejorX < 0) {
        return
    }
    // Una antorcha de pared puesta al azar en el mismo sitio le deja el lugar al cuadro.
    for (let adorno of sprites.allOfKind(TIPO_DECORADO)) {
        if (valorAbsoluto(adorno.x - (mejorX * 16 + 8)) < 20 && valorAbsoluto(adorno.y - (mejorY * 16 + 8)) < 16) {
            adorno.destroy()
        }
    }
    let cuadro = sprites.create(IMAGEN_HACKER_PARED, TIPO_DECORADO)
    cuadro.setFlag(SpriteFlag.Ghost, true)
    cuadro.z = -1
    tiles.placeOnTile(cuadro, tiles.getTileLocation(mejorX, mejorY))
    // Por encima del borde del muro, en medio de la pared
    cuadro.y = cuadro.y - 2
}

function limpiarPiso () {
    for (let spriteEnemigo of sprites.allOfKind(SpriteKind.Enemy)) {
        spriteEnemigo.destroy()
    }
    for (let llave of sprites.allOfKind(TIPO_LLAVE)) {
        llave.destroy()
    }
    for (let corazon of sprites.allOfKind(TIPO_CORAZON)) {
        corazon.destroy()
    }
    for (let moneda of sprites.allOfKind(TIPO_MONEDA)) {
        moneda.destroy()
    }
    for (let cofre of sprites.allOfKind(TIPO_COFRE)) {
        cofre.destroy()
    }
    for (let antorcha of sprites.allOfKind(TIPO_ANTORCHA)) {
        antorcha.destroy()
    }
    for (let adorno of sprites.allOfKind(TIPO_DECORADO)) {
        adorno.destroy()
    }
    for (let bolaEnemiga of sprites.allOfKind(TIPO_BOLA_ENEMIGA)) {
        bolaEnemiga.destroy()
    }
    // También las bolas de fuego del héroe: si no, una bola del piso anterior seguiría volando hasta 800 ms por el piso
    // nuevo, y eso confundiría al jugador.
    for (let bolaPropia of sprites.allOfKind(SpriteKind.Projectile)) {
        bolaPropia.destroy()
    }
    for (let nubecita of nubecitas) {
        nubecita.destroy()
    }
    nubecitas = []
    listaEnemigos = []
}
