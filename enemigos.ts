// Enemigos: la clase de datos, cómo se crean, cómo se buscan, sus disparos y el cerebro del jefe.

class Enemigo {
    sprite: Sprite
    especie: number
    vida: number
    // Vida con la que empezó; no cambia. Con ella actuarJefe calcula cuándo se enfada el jefe: lo hace como una
    // fracción de su vida total.
    vidaMax: number
    velocidad: number
    miradaX: number
    miradaY: number
    antesX: number
    antesY: number
    proximoDisparoMs: number
    enfadado: boolean
    constructor(sprite: Sprite, especie: number, vida: number, velocidad: number) {
        this.sprite = sprite
        this.especie = especie
        this.vida = vida
        this.vidaMax = vida
        this.velocidad = velocidad
        this.miradaX = 1
        this.miradaY = 0
        this.antesX = 0
        this.antesY = 0
        this.proximoDisparoMs = 0
        this.enfadado = false
    }
    
}

// desplazamiento aparta al segundo (1) y al tercer (2) enemigo de una sala del centro de la sala. Sin él estarían
// exactamente uno encima de otro: se vería uno solo y la física los separaría sin parar.
function colocarEnemigo (columna: number, fila: number, especie: number, desplazamiento: number = 0) {
    // Un grado cada PISOS_POR_GRADO pisos, redondeando hacia arriba: el piso 1 es el grado 1. A partir de GRADO_MAX los
    // enemigos no van más rápido; si no, acabarían alcanzando al héroe, cuya velocidad tiene
    // el tope VELOCIDAD_HEROE_MAX.
    let grado = Math.min(Math.idiv(piso + PISOS_POR_GRADO - 1, PISOS_POR_GRADO), GRADO_MAX)
    imagenEnemigoNuevo = IMAGEN_ESQUELETO
    vidaEnemigoNuevo = 2
    velocidadEnemigoNuevo = 20 + grado * 2
    if (especie == 1) {
        imagenEnemigoNuevo = IMAGEN_BABA
        vidaEnemigoNuevo = 3
        velocidadEnemigoNuevo = 16 + grado * 2
    } else if (especie == 2) {
        imagenEnemigoNuevo = IMAGEN_MURCIELAGO
        vidaEnemigoNuevo = 1
        velocidadEnemigoNuevo = 34 + grado * 2
    } else if (especie == 3) {
        imagenEnemigoNuevo = IMAGEN_MAGO
        vidaEnemigoNuevo = 2
        velocidadEnemigoNuevo = 20 + grado
    } else if (especie == 4) {
        // La mirada empieza hacia la derecha (mira el constructor de Enemigo), así que el escudo también debe empezar a
        // la derecha: la imagen y la comprobación de «por detrás» nunca deben ir cada una por su lado.
        imagenEnemigoNuevo = IMAGEN_GUARDIAN_DERECHA
        vidaEnemigoNuevo = 4
        velocidadEnemigoNuevo = 18 + grado * 2
    } else if (especie == 5) {
        // La vida del jefe crece con el piso, pero con tope: sin él, el combate a partir del piso 20 sería solo
        // aguantar durante una eternidad.
        imagenEnemigoNuevo = IMAGEN_JEFE
        vidaEnemigoNuevo = Math.min(VIDA_JEFE_BASE + piso, VIDA_JEFE_MAX)
        velocidadEnemigoNuevo = 16 + grado
        if (piso >= PISO_JEFE_FINAL) {
            // El ladrón de la corona: la corona robada se pinta en una COPIA de la imagen del jefe (la fila 0 está
            // libre y en la fila 1 el aro sustituye al borde de la cabeza); la imagen original de graficos.ts no
            // cambia. Además se presenta con toda su vida: es el combate final.
            imagenEnemigoNuevo = IMAGEN_JEFE.clone()
            for (let columnaCorona = 5; columnaCorona <= 10; columnaCorona++) {
                imagenEnemigoNuevo.setPixel(columnaCorona, 1, 5)
            }
            imagenEnemigoNuevo.setPixel(7, 1, 2)
            imagenEnemigoNuevo.setPixel(8, 1, 2)
            imagenEnemigoNuevo.setPixel(5, 0, 5)
            imagenEnemigoNuevo.setPixel(7, 0, 5)
            imagenEnemigoNuevo.setPixel(8, 0, 5)
            imagenEnemigoNuevo.setPixel(10, 0, 5)
            vidaEnemigoNuevo = VIDA_JEFE_MAX
        }
    }
    spriteEnemigoNuevo = sprites.create(imagenEnemigoNuevo, SpriteKind.Enemy)
    if (especie == 2) {
        spriteEnemigoNuevo.setFlag(SpriteFlag.GhostThroughWalls, true)
    }
    if (especie == 5) {
        spriteEnemigoNuevo.setScale(2, ScaleAnchor.Middle)
    }
    tiles.placeOnTile(spriteEnemigoNuevo, tiles.getTileLocation(columna, fila))
    // El centro de la sala tiene al menos un mosaico libre en cada dirección (crearSalas: la sala más pequeña mide 3
    // mosaicos por 3), así que desplazar 12 y 8 píxeles siempre deja al enemigo sobre el suelo.
    if (desplazamiento == 1) {
        spriteEnemigoNuevo.x = spriteEnemigoNuevo.x + 12
        spriteEnemigoNuevo.y = spriteEnemigoNuevo.y - 8
    } else if (desplazamiento == 2) {
        spriteEnemigoNuevo.x = spriteEnemigoNuevo.x - 12
        spriteEnemigoNuevo.y = spriteEnemigoNuevo.y + 8
    }
    listaEnemigos.push(new Enemigo(spriteEnemigoNuevo, especie, vidaEnemigoNuevo, velocidadEnemigoNuevo))
}

// Tira un dado para ver si entra otro enemigo en la sala. Desde el piso desdePiso la probabilidad empieza en una décima
// y sube una décima por piso, hasta el tope (también en décimas).
function otroEnemigo (desdePiso: number, tope: number) {
    if (listaEnemigos.length >= ENEMIGOS_MAX) {
        return false
    }
    let decimas = piso - desdePiso + 1
    if (decimas < 1) {
        return false
    }
    if (decimas > tope) {
        decimas = tope
    }
    return randint(1, 10) <= decimas
}

// Gira el escudo del guardián para que se vea hacia dónde mira. Solo así sabe el jugador dónde está «por detrás»,
// porque solo cuentan los golpes justo en la espalda. Las cuatro imágenes miden lo mismo y se crean al arrancar;
// setImage se sale solo cuando la imagen ya es la correcta.
function ponerImagenGuardian (guardian: Enemigo) {
    if (guardian.miradaY > 0) {
        guardian.sprite.setImage(IMAGEN_GUARDIAN_ABAJO)
    } else if (guardian.miradaY < 0) {
        guardian.sprite.setImage(IMAGEN_GUARDIAN_ARRIBA)
    } else if (guardian.miradaX < 0) {
        guardian.sprite.setImage(IMAGEN_GUARDIAN_IZQUIERDA)
    } else {
        guardian.sprite.setImage(IMAGEN_GUARDIAN_DERECHA)
    }
}

function buscarEnemigo (sprite: Sprite) {
    for (let enemigo of listaEnemigos) {
        if (enemigo.sprite == sprite) {
            return enemigo
        }
    }
    return null
}

function lanzarBolaEnemiga (origen: Sprite, velocidadX: number, velocidadY: number) {
    bolaMagicaNueva = sprites.createProjectileFromSprite(IMAGEN_BOLA_MAGICA, origen, velocidadX, velocidadY)
    bolaMagicaNueva.setKind(TIPO_BOLA_ENEMIGA)
    bolaMagicaNueva.lifespan = 2500
    bolaMagicaNueva.setFlag(SpriteFlag.DestroyOnWall, true)
}
function especieAlAzar () {
    // Los umbrales están en ajustes.ts, y los carteles del tutorial de la intro leen las mismas constantes para sus
    // líneas «Desde el piso N».
    especieMaxima = 1
    if (piso >= PISO_MURCIELAGO) {
        especieMaxima = 2
    }
    if (piso >= PISO_MAGO) {
        especieMaxima = 3
    }
    if (piso >= PISO_GUARDIAN) {
        especieMaxima = 4
    }
    return randint(0, especieMaxima)
}

function actuarJefe(jefe: Enemigo, distanciaX: number, distanciaY: number) {
    let spriteJefe = jefe.sprite
    // Se enfada en el último tercio del combate: según una fracción de la vida y no con un número fijo, para que la
    // fase salvaje no se quede en un detalle cuando el jefe tiene mucha vida.
    if (jefe.vida <= Math.idiv(jefe.vidaMax, FRACCION_FURIA_JEFE) && !jefe.enfadado) {
        jefe.enfadado = true
        jefe.velocidad = jefe.velocidad + 16
        spriteJefe.startEffect(effects.fire, 500)
        scene.cameraShake(4, 400)
    }
    
    if (valorAbsoluto(distanciaX) > valorAbsoluto(distanciaY)) {
        spriteJefe.vy = 0
        spriteJefe.vx = signo(distanciaX) * jefe.velocidad
    } else {
        spriteJefe.vx = 0
        spriteJefe.vy = signo(distanciaY) * jefe.velocidad
    }
    
    if (game.runtime() > jefe.proximoDisparoMs) {
        jefe.proximoDisparoMs = game.runtime() + 2200
        lanzarBolaEnemiga(spriteJefe, 60, 0)
        lanzarBolaEnemiga(spriteJefe, 0 - 60, 0)
        lanzarBolaEnemiga(spriteJefe, 0, 60)
        lanzarBolaEnemiga(spriteJefe, 0, 0 - 60)
        if (jefe.enfadado) {
            lanzarBolaEnemiga(spriteJefe, 45, 45)
            lanzarBolaEnemiga(spriteJefe, 45, 0 - 45)
            lanzarBolaEnemiga(spriteJefe, 0 - 45, 45)
            lanzarBolaEnemiga(spriteJefe, 0 - 45, 0 - 45)
        }
        
    }
    
}
