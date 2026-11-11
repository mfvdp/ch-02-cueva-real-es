// Un juego de mazmorras al azar para MakeCode Arcade.
//
// Cruceta = andar, A = bola de fuego
// Encuentra la llave, busca la escalera y baja cada vez más. Cada 5 pisos espera un jefe. Los cofres dan mejoras.
//
// Este archivo solo contiene el arranque del juego y los bucles de actualización. Todo lo demás está en archivos
// propios. El orden de pxt.json es el orden de ejecución.

// Si DIAGNOSTICO está activado, muestra un color y espera un momento para que la pantalla llegue a dibujarlo. Sin
// DIAGNOSTICO, la llamada no cuesta nada.
function marcarPaso(color: number) {
    if (!DIAGNOSTICO) {
        return
    }
    scene.setBackgroundColor(color)
    pause(700)
}

catalogo.inicializar()
marcarPaso(8)
mostrarPantallaTitulo()
marcarPaso(6)
scene.setBackgroundColor(15)
info.setLife(VIDAS_INICIALES)
info.setScore(0)
heroe = sprites.create(IMAGEN_HEROE, SpriteKind.Player)
heroe.z = 5
controller.moveSprite(heroe, velocidadHeroe, velocidadHeroe)
marcarPaso(7)
if (OSCURIDAD) {
    // La oscuridad está pegada a la cámara (160 × 120); el agujero de luz se mueve DENTRO de la imagen hasta la
    // posición del héroe en la pantalla (dibujarOscuridad, más abajo en game.onUpdate).
    imagenOscuridad = image.create(160, 120)
    capaOscura = sprites.create(imagenOscuridad, TIPO_MARCADOR)
    capaOscura.setFlag(SpriteFlag.Ghost, true)
    capaOscura.setFlag(SpriteFlag.RelativeToCamera, true)
    capaOscura.z = 90
    capaOscura.setPosition(80, 60)
}
marcadorLlave = sprites.create(IMAGEN_LLAVE, TIPO_MARCADOR)
marcadorLlave.setFlag(SpriteFlag.Ghost, true)
marcadorLlave.setFlag(SpriteFlag.RelativeToCamera, true)
marcadorLlave.setPosition(80, 10)
marcadorLlave.z = 100
// Crear YA el mapa general y el indicador del piso, mientras la memoria todavía está de una pieza, y no volver a
// crearlos nunca en mitad de la partida.
crearMarcadores()
marcarPaso(5)
ponerLuz(LUZ_NORMAL)
// Pintar una vez enseguida: game.onUpdate solo funciona después de construirPiso(), y hasta entonces la capa sería
// del todo transparente.
if (capaOscura != null) {
    dibujarOscuridad()
}
marcarPaso(4)
construirPiso()
marcarPaso(2)
game.onUpdate(function () {
    if (!(juegoActivo)) {
        return
    }
    if (heroe.vx != 0 || heroe.vy != 0) {
        if (valorAbsoluto(heroe.vx) > valorAbsoluto(heroe.vy)) {
            miradaY = 0
            miradaX = signo(heroe.vx)
        } else {
            miradaX = 0
            miradaY = signo(heroe.vy)
        }
        ponerImagenHeroe()
    }
    if (controller.A.isPressed()) {
        dispararConA()
    }
    if (nubecitas.length > 0) {
        avanzarNubecitas()
    }
    if (capaOscura != null) {
        dibujarOscuridad()
    }
})
game.onUpdateInterval(280, function () {
    let spriteEnemigo: Sprite;
let distanciaX: number;
let distanciaY: number;
let distancia: any;
let atascado: any;
let puedeGirar: boolean;
let horizontal: boolean;
if (!(juegoActivo)) {
        return
    }
    for (let enemigo of listaEnemigos) {
        if (enemigo.vida > 0) {
            spriteEnemigo = enemigo.sprite
distanciaX = heroe.x - spriteEnemigo.x
            distanciaY = heroe.y - spriteEnemigo.y
            distancia = valorAbsoluto(distanciaX) + valorAbsoluto(distanciaY)
            if (distancia > 100 && enemigo.especie != 5) {
                spriteEnemigo.vx = 0
                spriteEnemigo.vy = 0
            } else {
                atascado = valorAbsoluto(spriteEnemigo.x - enemigo.antesX) < 1 &&
                    valorAbsoluto(spriteEnemigo.y - enemigo.antesY) < 1
                enemigo.antesX = spriteEnemigo.x
enemigo.antesY = spriteEnemigo.y
puedeGirar = true
                if (enemigo.especie == 4 && game.runtime() < enemigo.proximoDisparoMs) {
                    puedeGirar = false
                }
                if (puedeGirar) {
                    // distanciaX == 0 Y distanciaY == 0: se mantiene la dirección de mirada anterior. signo(0) valdría
                    // cero, y con la mirada (0, 0) el guardián sería invulnerable desde CUALQUIER lado (la comprobación
                    // de «por detrás» de eventos.ts nunca sería cierta), se quedaría quieto y enseñaría la imagen
                    // de escudo equivocada.
                    if (valorAbsoluto(distanciaX) > valorAbsoluto(distanciaY)) {
                        enemigo.miradaX = signo(distanciaX)
enemigo.miradaY = 0
                    } else if (distanciaY != 0) {
                        enemigo.miradaX = 0
enemigo.miradaY = signo(distanciaY)
                    }
                    if (enemigo.especie == 4) {
                        enemigo.proximoDisparoMs = game.runtime() + 1400
                        ponerImagenGuardian(enemigo)
                    }
                }
                if (enemigo.especie == 2) {
                    spriteEnemigo.vx = signo(distanciaX) * enemigo.velocidad
                    spriteEnemigo.vy = signo(distanciaY) * enemigo.velocidad + randint(0 - 25, 25)
                } else if (enemigo.especie == 3) {
                    if (distancia < 70) {
                        spriteEnemigo.vx = 0 - signo(distanciaX) * enemigo.velocidad
                        spriteEnemigo.vy = 0 - signo(distanciaY) * enemigo.velocidad
                    } else if (distancia > 115) {
                        spriteEnemigo.vx = signo(distanciaX) * enemigo.velocidad
                        spriteEnemigo.vy = signo(distanciaY) * enemigo.velocidad
                    } else {
                        spriteEnemigo.vx = 0
                        spriteEnemigo.vy = 0
                    }
                    if (game.runtime() > enemigo.proximoDisparoMs) {
                        enemigo.proximoDisparoMs = game.runtime() + 1700
lanzarBolaEnemiga(spriteEnemigo, signo(distanciaX) * 70, signo(distanciaY) * 70)
                    }
                } else if (enemigo.especie == 4) {
                    spriteEnemigo.vx = enemigo.miradaX * enemigo.velocidad
                    spriteEnemigo.vy = enemigo.miradaY * enemigo.velocidad
                } else if (enemigo.especie == 5) {
                    actuarJefe(enemigo, distanciaX, distanciaY)
                } else {
                    horizontal = valorAbsoluto(distanciaX) > valorAbsoluto(distanciaY)
                    if (atascado) {
                        horizontal = !(horizontal)
                    }
                    if (randint(0, 6) == 0) {
                        horizontal = !(horizontal)
                    }
                    if (horizontal) {
                        spriteEnemigo.vy = 0
                        spriteEnemigo.vx = signo(distanciaX) * enemigo.velocidad
                    } else {
                        spriteEnemigo.vx = 0
                        spriteEnemigo.vy = signo(distanciaY) * enemigo.velocidad
                    }
                }
            }
        }
    }
})
game.onUpdateInterval(120, function () {
    if (!(juegoActivo)) {
        return
    }
    if (game.runtime() < proteccionHastaMs) {
        heroe.setFlag(SpriteFlag.Invisible, Math.idiv(game.runtime(), 120) % 2 == 0)
    } else {
        heroe.setFlag(SpriteFlag.Invisible, false)
    }
    if (luzHastaMs > 0 && game.runtime() > luzHastaMs) {
        luzHastaMs = 0
        ponerLuz(LUZ_NORMAL)
    }
})
