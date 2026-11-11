// Todos los manejadores de eventos. Se ejecuta después de tipos.ts y graficos.ts, porque los TIPO_* y los MOSAICO_* se
// leen ya al registrar los manejadores.

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    aPulsada = true
})
sprites.onOverlap(SpriteKind.Player, TIPO_CORAZON, function (jugador, objeto) {
    objeto.destroy(effects.hearts, 200)
    info.changeLifeBy(1)
    sonido.sonarCorazon()
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (bolaDeFuego, spriteEnemigo) {
    let porDetras: any;
let llaveDelJefe: Sprite;
enemigoTocado = buscarEnemigo(spriteEnemigo)
    // Sin efecto de fuego en el proyectil: cada efecto crea una fuente de partículas que dura 750 ms y dos copias de
    // imagen. Con el disparo triple rápido serían 15 por segundo. El golpe ya se nota bastante en el propio enemigo
    // (chispas y desvanecer).
    bolaDeFuego.destroy()
    if (enemigoTocado == null) {
        return
    }
    if (enemigoTocado.especie == 4) {
        porDetras = bolaDeFuego.vx * enemigoTocado.miradaX > 0 || bolaDeFuego.vy * enemigoTocado.miradaY > 0
        if (!(porDetras)) {
            spriteEnemigo.startEffect(effects.spray, 100)
            sonido.sonarEscudo()
            return
        }
    }
    enemigoTocado.vida = enemigoTocado.vida - 1
enemigoX = spriteEnemigo.x
    enemigoY = spriteEnemigo.y
    if (enemigoTocado.vida <= 0) {
        // Sin deshacerse en sus propios colores (con el jefe rojo llovían píxeles rojos): el enemigo desaparece al
        // instante y se desvanece en estrellas claras, más grandes si es el jefe. Antes se apagan todas las partículas
        // del enemigo, también las que ya vuelan; si no, las chispas rojas de la furia (actuarJefe) seguirían flotando
        // unos 0,7 s sobre las estrellas y la llave.
        //
        // (particleSources solo existe después de la primera fuente de partículas; se recorre hacia atrás porque
        // destroy() quita la fuente de la lista.)
        let fuentes = game.currentScene().particleSources
        if (fuentes) {
            for (let i = fuentes.length - 1; i >= 0; i--) {
                if (fuentes[i].anchor == spriteEnemigo) {
                    fuentes[i].clear()
                    fuentes[i].destroy()
                }
            }
        }
        spriteEnemigo.destroy()
        desvanecer(enemigoX, enemigoY, enemigoTocado.especie == 5)
        if (enemigoTocado.especie == 5) {
            jefeActivo = false
            info.changeScoreBy(100)
            scene.cameraShake(6, 700)
            sonido.sonarJefeDesvanecido()
            if (piso >= PISO_JEFE_FINAL) {
                // Ese era el ladrón de la corona: la corona queda libre y el juego está ganado. Se suma una
                // bonificación y después toma el mando el final (aquí espera hasta terminar, igual que el cuadro del
                // fin de la partida).
                info.changeScoreBy(400)
                epilogo.reproducir()
                return
            }
            llaveDelJefe = sprites.create(IMAGEN_LLAVE, TIPO_LLAVE)
            // ¡No uses SpriteFlag.Ghost! Ghost incluye GhostThroughSprites: la llave no tendría solapes y no se podría
            // coger. Todos los demás objetos también usan GhostThroughWalls (mira ponerObjeto en objetos.ts).
            llaveDelJefe.setFlag(SpriteFlag.GhostThroughWalls, true)
            llaveDelJefe.setPosition(enemigoX, enemigoY)
        } else {
            info.changeScoreBy(10)
            sonido.sonarEnemigoDesvanecido()
        }
    } else {
        // El enemigo recibe un golpe pero no desaparece. El destello del golpe viene del efecto spray de la línea
        // siguiente; copiar la imagen del enemigo no cambiaría nada, porque una copia se ve igual y solo costaría una
        // copia de imagen en cada golpe.
        spriteEnemigo.startEffect(effects.spray, 100)
        sonido.sonarGolpe()
    }
})

sprites.onOverlap(SpriteKind.Player, TIPO_ANTORCHA, function (jugador, objeto) {
    objeto.destroy(effects.fire, 200)
    luzHastaMs = game.runtime() + ANTORCHA_MS
    ponerLuz(LUZ_ANTORCHA)
    heroe.sayText(catalogo.texto(catalogo.IdTexto.ANTORCHA), 700, false)
    sonido.sonarAntorcha()
})

sprites.onOverlap(SpriteKind.Player, TIPO_MONEDA, function (jugador, objeto) {
    objeto.destroy()
    info.changeScoreBy(5)
    sonido.sonarMoneda()
})
sprites.onOverlap(SpriteKind.Player, TIPO_LLAVE, function (jugador, objeto) {
    cantidadLlaves += 1
    objeto.destroy(effects.confetti, 200)
    marcadorLlave.setFlag(SpriteFlag.Invisible, false)
    heroe.sayText(catalogo.texto(catalogo.IdTexto.LLAVE), 800, false)
    sonido.sonarLlave()
})

sprites.onOverlap(SpriteKind.Player, TIPO_COFRE, function (jugador, cofre) {
    cofre.destroy(effects.confetti, 300)
    sonido.sonarCofre()
    eleccionCofre = randint(0, 3)
    if (eleccionCofre == 0 && !(triple)) {
        triple = true
        heroe.sayText(catalogo.texto(catalogo.IdTexto.DISPARO_TRIPLE), 1200, false)
    } else if (eleccionCofre == 1 && recargaMs > RECARGA_RAPIDA_MS) {
        recargaMs = RECARGA_RAPIDA_MS
        heroe.sayText(catalogo.texto(catalogo.IdTexto.FUEGO_RAPIDO), 1200, false)
    } else if (eleccionCofre == 2 && velocidadHeroe < VELOCIDAD_HEROE_MAX) {
        // Sin un máximo, las botas se acumularían sin fin y el héroe acabaría siendo imposible de controlar. Si ya se
        // llegó al máximo, el cofre da un corazón extra en su lugar.
        velocidadHeroe = Math.min(velocidadHeroe + VELOCIDAD_BOTAS, VELOCIDAD_HEROE_MAX)
        controller.moveSprite(heroe, velocidadHeroe, velocidadHeroe)
        heroe.sayText(catalogo.texto(catalogo.IdTexto.BOTAS), 1200, false)
    } else {
        info.changeLifeBy(1)
        heroe.sayText(catalogo.texto(catalogo.IdTexto.CORAZON_EXTRA), 1200, false)
    }
})

scene.onOverlapTile(SpriteKind.Player, MOSAICO_PINCHOS, function (jugador, ubicacion) {
    if (game.runtime() < proteccionHastaMs) {
        return
    }
    recibirGolpe(1)
    jugador.startEffect(effects.spray, 200)
})
scene.onOverlapTile(SpriteKind.Player, MOSAICO_ESCALERA, function (jugador, ubicacion) {
    if (jefeActivo || cantidadLlaves == 0) {
        // Este manejador se activa en CADA fotograma mientras el héroe está sobre el mosaico. Sin el bloqueo, sayText
        // crearía en cada fotograma un cuadro de texto nuevo y lo dibujaría letra por letra: unos 40 KB de basura por
        // segundo, que rompe la memoria en trozos mientras el jugador espera sin saber qué hacer.
        if (game.runtime() < avisoHastaMs) {
            return
        }
        avisoHastaMs = game.runtime() + 1200
        if (jefeActivo) {
            heroe.sayText(catalogo.texto(catalogo.IdTexto.FALTA_VENCER_JEFE), 900, false)
        } else {
            heroe.sayText(catalogo.texto(catalogo.IdTexto.FALTA_LLAVE), 900, false)
        }
        return
    }
    // La profundidad cuenta: cuanto más abajo, más puntos da cada piso superado. Así se compensa que abajo haya menos
    // monedas (más corazones: mira construirPiso).
    info.changeScoreBy(piso * 5)
    piso += 1
    sonido.sonarPisoSuperado()
    construirPiso()
})

sprites.onOverlap(TIPO_BOLA_ENEMIGA, SpriteKind.Player, function (bolaMagica, jugador) {
    bolaMagica.destroy(effects.spray, 100)
    recibirGolpe(1)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (jugador, spriteEnemigo) {
    if (game.runtime() < proteccionHastaMs) {
        return
    }
    recibirGolpe(1)
    if (spriteEnemigo.x > jugador.x) {
        spriteEnemigo.x = spriteEnemigo.x + 22
    } else {
        spriteEnemigo.x = spriteEnemigo.x - 22
    }
    if (spriteEnemigo.y > jugador.y) {
        spriteEnemigo.y = spriteEnemigo.y + 22
    } else {
        spriteEnemigo.y = spriteEnemigo.y - 22
    }
})

info.onLifeZero(function () {
    // Primero parar y luego mostrar el texto: mostrarDespedida espera hasta que se cierra el cuadro, y sin esta marca
    // los enemigos y el disparo seguirían funcionando mientras se muestra el cuadro.
    juegoActivo = false
    // Hacer sitio ANTES de que el texto de despedida y game.over pidan otra vez 9,6 KB de una pieza: la oscuridad ya no
    // se necesita y su imagen puede recogerla el recolector de basura.
    if (capaOscura != null) {
        capaOscura.destroy()
        capaOscura = null
    }
    imagenOscuridad = null
    sonido.sonarFinPartida()
    // Un cuadro propio en lugar de game.showLongText: el botón A solo cuenta pasado un segundo (mira
    // catalogo.mostrarDespedida en menus.ts).
    catalogo.mostrarDespedida(catalogo.formatear(catalogo.IdTexto.FIN_PARTIDA, piso, info.score()))
    // game.over(false) no guarda la mejor puntuación: sin esta llamada, la pantalla del título
    // mostraría siempre «Récord: 0».
    info.saveHighScore()
    game.over(false)
})

// Desvanecer: un enemigo vencido se convierte en una nubecita de estrellas amarillas y blancas. A propósito NO es un
// efecto de partículas (cada fuente de partículas crea copias de imagen, mira más arriba), sino un único sprite
// fantasma con tres imágenes fijas de la memoria flash y una vida limitada. Así, aunque se venzan muchos enemigos
// seguidos, casi no se gasta memoria.
function desvanecer (x: number, y: number, grande: boolean) {
    let nubecita = sprites.create(IMAGEN_NUBECITA_1, TIPO_NUBECITA)
    nubecita.setFlag(SpriteFlag.Ghost, true)
    nubecita.setPosition(x, y)
    nubecita.z = 6
    nubecita.lifespan = NUBECITA_MS
    if (grande) {
        nubecita.setScale(2)
    }
    nubecitas.push(nubecita)
}

// Cambia las imágenes de las nubecitas según el tiempo que les queda y se olvida de las que ya desaparecieron. Se
// llama desde game.onUpdate.
function avanzarNubecitas () {
    let nubecita: Sprite
    for (let i = nubecitas.length - 1; i >= 0; i--) {
        nubecita = nubecitas[i]
        if (nubecita.flags & sprites.Flag.Destroyed) {
            nubecitas.removeAt(i)
        } else if (nubecita.lifespan < Math.idiv(NUBECITA_MS, 3)) {
            if (nubecita.image != IMAGEN_NUBECITA_3) {
                nubecita.setImage(IMAGEN_NUBECITA_3)
            }
        } else if (nubecita.lifespan < Math.idiv(NUBECITA_MS * 2, 3)) {
            if (nubecita.image != IMAGEN_NUBECITA_2) {
                nubecita.setImage(IMAGEN_NUBECITA_2)
            }
        }
    }
}
