// El héroe: disparar bolas de fuego, elegir la imagen según hacia dónde mira y recibir golpes.

function disparar (direccionX: number, direccionY: number) {
    bolaNueva = sprites.createProjectileFromSprite(IMAGEN_BOLA_DE_FUEGO,
        heroe, direccionX * VELOCIDAD_BOLA_FUEGO, direccionY * VELOCIDAD_BOLA_FUEGO)
    bolaNueva.lifespan = 800
    bolaNueva.setFlag(SpriteFlag.DestroyOnWall, true)
}

function dispararConA () {
    if (game.runtime() < disparoLibreDesdeMs) {
        return
    }
    disparoLibreDesdeMs = game.runtime() + recargaMs
    disparar(miradaX, miradaY)
    if (triple) {
        disparar(miradaX + miradaY, miradaY + miradaX)
        disparar(miradaX - miradaY, miradaY - miradaX)
    }
    sonido.sonarDisparo()
}

// Elige la imagen según hacia dónde mira. Las cuatro imágenes miden lo mismo, así que la zona de contacto no cambia.
// setImage se sale solo cuando la imagen ya es la correcta.
function ponerImagenHeroe() {
    if (miradaY > 0) {
        heroe.setImage(IMAGEN_HEROE_ABAJO)
    } else if (miradaY < 0) {
        heroe.setImage(IMAGEN_HEROE_ARRIBA)
    } else if (miradaX < 0) {
        heroe.setImage(IMAGEN_HEROE_IZQUIERDA)
    } else if (miradaX > 0) {
        heroe.setImage(IMAGEN_HEROE_DERECHA)
    }
}

function recibirGolpe (cantidad: number) {
    if (game.runtime() < proteccionHastaMs) {
        return
    }
    proteccionHastaMs = game.runtime() + PROTECCION_MS
    info.changeLifeBy(0 - cantidad)
    sonido.sonarHeroeGolpeado()
    scene.cameraShake(4, 250)
}
