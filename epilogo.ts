// Epílogo: la victoria. Se reproduce cuando cae el ladrón de la corona (se dispara en
// eventos.ts, piso PISO_JEFE_FINAL).
//
// El héroe se acerca al ladrón caído, la corona flota hacia él, se la pone y escapa por el portal de
// luz; después, game.over(true).
//
// Se pinta como en la intro, en una pantalla completa de 160 × 120. Pero no como fondo: el mapa de mosaicos quedaría
// DELANTE de una imagen de fondo. Por eso la imagen cuelga de un sprite del marcador con z = 300, que está por encima
// de todo. Quien cambia la imagen cambia enseguida lo que se ve, igual que con la capa de oscuridad.
//
// Antes, reproducir() recoge todo: enemigos, objetos y sobre todo la oscuridad de 9,6 KB; así seguro hay sitio para la
// pantalla. A salta las escenas como en la intro.
namespace epilogo {
    // Se pone en cuanto se ha pulsado A.
    let saltoPedido = false
    // Hasta esta hora (game.runtime) caduca una pulsación. El epílogo empieza en pleno combate, a menudo con A
    // machacada: un disparo que llega tarde no debe saltarse de golpe toda la victoria.
    let bloqueoHastaMs = 0

    // Espera en trocitos pequeños y se fija en si se pulsa un botón.
    function esperar(duracion: number) {
        let restante = duracion
        let trozo = 0
        while (restante > 0) {
            if (aPulsada && game.runtime() < bloqueoHastaMs) {
                aPulsada = false
            }
            if (aPulsada) {
                saltoPedido = true
                return
            }
            trozo = 30
            if (restante < trozo) {
                trozo = restante
            }
            pause(trozo)
            restante = restante - trozo
        }
        if (aPulsada && game.runtime() >= bloqueoHastaMs) {
            saltoPedido = true
        }
    }

    // El salón del trono del ladrón: pared, suelo y dos antorchas. Delante, a la derecha, en el borde, está el Calliope
    // Hacker como espectador, de espaldas igual que en la tarjeta del estudio, al doble de tamaño como las figuras de
    // la coronación (a tamaño normal, la sudadera negra se perdería ante las piedras oscuras). celebrando = levanta los
    // brazos al ritmo de las antorchas.
    function dibujarSalaTrono(parpadeo: number, celebrando: boolean = false) {
        dibujarMuro(lienzoPantalla, 0, 96, 20 - parpadeo * 2, 140 + parpadeo * 2, 44)
        dibujarSuelo(lienzoPantalla, 96, 20, 140)
        dibujarAntorcha(lienzoPantalla, 20, parpadeo, 44)
        dibujarAntorcha(lienzoPantalla, 140, parpadeo, 44)
        if (celebrando && parpadeo == 1) {
            intro.dibujarDoble(IMAGEN_ESPECTADOR_ALEGRE, 136, 79)
        } else {
            intro.dibujarDoble(IMAGEN_ESPECTADOR, 136, 79)
        }
    }

    // Una corona pequeña, a la medida del héroe. esquinaX y esquinaY son la esquina de arriba a la izquierda de las
    // puntas; el aro mide 8 × escala píxeles de ancho. escala = 2 para el héroe al doble de tamaño en la coronación.
    function dibujarCoronaPequena(esquinaX: number, esquinaY: number, escala: number = 1) {
        lienzoPantalla.fillRect(esquinaX, esquinaY + 2 * escala, 8 * escala, 2 * escala, 5)
        lienzoPantalla.fillRect(esquinaX, esquinaY, 2 * escala, 2 * escala, 5)
        lienzoPantalla.fillRect(esquinaX + 3 * escala, esquinaY, 2 * escala, 2 * escala, 5)
        lienzoPantalla.fillRect(esquinaX + 6 * escala, esquinaY, 2 * escala, 2 * escala, 5)
        lienzoPantalla.fillRect(esquinaX + 4 * escala, esquinaY + 2 * escala, escala, escala, 2)
    }

    // Estrellitas giran sobre el ladrón caído.
    function dibujarEstrellitas(centroX: number, centroY: number, fotograma: number) {
        if (fotograma % 3 == 0) {
            lienzoPantalla.setPixel(centroX - 8, centroY, 5)
            lienzoPantalla.setPixel(centroX + 6, centroY - 3, 1)
        } else if (fotograma % 3 == 1) {
            lienzoPantalla.setPixel(centroX, centroY - 5, 1)
            lienzoPantalla.setPixel(centroX + 8, centroY + 1, 5)
        } else {
            lienzoPantalla.setPixel(centroX - 5, centroY - 4, 5)
            lienzoPantalla.setPixel(centroX + 2, centroY + 2, 1)
        }
    }

    export function reproducir() {
        // Parar el juego y hacer sitio. moveSprite(0, 0) congela al héroe: si no, durante el epílogo aún podría caminar
        // sin verse hasta la escalera y construir un piso.
        juegoActivo = false
        sonido.pararMusica()
        // La música de la victoria acompaña el epílogo hasta las tarjetas finales: re mayor, como resolución de la
        // historia en re menor.
        sonido.iniciarMusicaVictoria()
        controller.moveSprite(heroe, 0, 0)
        if (capaOscura != null) {
            capaOscura.destroy()
            capaOscura = null
        }
        // También se suelta la referencia a la imagen: el sprite ya no existe, pero imagenOscuridad seguiría reteniendo
        // la imagen de la oscuridad en la memoria.
        imagenOscuridad = null
        limpiarPiso()
        aPulsada = false
        saltoPedido = false
        bloqueoHastaMs = game.runtime() + 1000
        // La pantalla: un sprite del marcador por encima de todo.
        lienzoPantalla = image.create(160, 120)
        let spritePantalla = sprites.create(lienzoPantalla, TIPO_MARCADOR)
        spritePantalla.setFlag(SpriteFlag.Ghost, true)
        spritePantalla.setFlag(SpriteFlag.RelativeToCamera, true)
        spritePantalla.z = 300
        spritePantalla.setPosition(80, 60)
        // El ladrón está caído: flipY lo pone cabeza abajo.
        let jefeCaido = IMAGEN_JEFE.clone()
        jefeCaido.flipY()
        let fuenteGrande = image.doubledFont(image.font8)
        // 1) El héroe se acerca al ladrón caído y se abre el diafragma.
        for (let fotograma = 0; fotograma < 11; fotograma++) {
            if (saltoPedido) {
                break
            }
            dibujarSalaTrono(fotograma % 2)
            intro.dibujarDoble(jefeCaido, 100, 64)
            dibujarEstrellitas(116, 58, fotograma)
            intro.dibujarCorona(116, 56, fotograma % 2 == 0)
            lienzoPantalla.drawTransparentImage(IMAGEN_HEROE_DERECHA, -16 + fotograma * 10, 78)
            cine.dibujarMarco(0, 0, cine.altoBarraAbriendo(fotograma))
            esperar(130)
        }
        // 2) LA CORONACIÓN. Parte A: la corona flota hasta el héroe y el tiempo mismo se hace más lento: cada fotograma
        // dura más que el anterior. Campanas lejanas.
        const PASOS_CORONACION_MS = [140, 140, 160, 200, 260, 330, 420]
        sonido.sonarCampanas()
        for (let fotograma = 0; fotograma < 7; fotograma++) {
            if (saltoPedido) {
                break
            }
            let coronaX = 116 - fotograma * 4
            let coronaY = 56 + fotograma * 2
            dibujarSalaTrono(fotograma % 2, true)
            intro.dibujarDoble(jefeCaido, 100, 64)
            lienzoPantalla.drawTransparentImage(IMAGEN_HEROE_DERECHA, 84, 78)
            cine.dibujarRayos(coronaX, coronaY, 24 + fotograma * 5, fotograma % 2, 4, 5)
            intro.dibujarCorona(coronaX, coronaY, true)
            cine.dibujarDestello(coronaX, coronaY, 5 + (fotograma % 2) * 2, 1)
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            esperar(PASOS_CORONACION_MS[fotograma])
        }
        // Parte B: EL GOLPE: la corona toca la cabeza.
        if (!saltoPedido) {
            sonido.sonarCorona()
            lienzoPantalla.fill(1)
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            esperar(70)
        }
        // Parte C: el plano del héroe: el coronado al doble de tamaño, onda de choque, círculos de rayos y confeti.
        for (let fotograma = 0; fotograma < 5; fotograma++) {
            if (saltoPedido) {
                break
            }
            lienzoPantalla.fill(15)
            cine.dibujarOnda(80, 50, 20 + fotograma * 28, 1, 5, 4)
            cine.dibujarRayos(80, 50, 150, fotograma % 2, 5, 14)
            cine.dibujarRayos(80, 50, 150, 1 - fotograma % 2, 4, 7)
            intro.dibujarDoble(IMAGEN_HEROE_DERECHA, 64, 42)
            dibujarCoronaPequena(72, 36, 2)
            cine.dibujarConfeti(fotograma)
            cine.sacudirMarco(fotograma, cine.ALTO_BARRA)
            esperar(90)
        }
        // Parte D: imagen parada con luz dorada.
        sonido.sonarCofre()
        for (let fotograma = 0; fotograma < 5; fotograma++) {
            if (saltoPedido) {
                break
            }
            lienzoPantalla.fill(15)
            cine.dibujarRayos(80, 50, 150, fotograma % 2, 14, 12)
            lienzoPantalla.fillCircle(80, 54, 44, 4)
            lienzoPantalla.fillCircle(80, 54, 32, 5)
            intro.dibujarDoble(IMAGEN_HEROE_DERECHA, 64, 42)
            dibujarCoronaPequena(72, 36, 2)
            cine.dibujarDestello(80, 38, 8, 1)
            cine.dibujarConfeti(fotograma + 5)
            textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.VUELVE_EL_REY), 96, 5, 15, image.font8)
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            esperar(200)
        }
        // 3) La huida como silueta: el héroe es una sombra delante del portal deslumbrante; solo su
        // corona sigue dorada.
        let heroeSilueta = IMAGEN_HEROE_IZQUIERDA.clone()
        for (let color = 1; color < 16; color++) {
            heroeSilueta.replace(color, 15)
        }
        for (let fotograma = 0; fotograma < 8; fotograma++) {
            if (saltoPedido) {
                break
            }
            dibujarSalaTrono(fotograma % 2, true)
            intro.dibujarDoble(jefeCaido, 100, 64)
            cine.dibujarRayo(6, 70, 0, 180, 26 + fotograma * 5, 13)
            cine.dibujarRayo(6, 70, 1, 150, 14, 1)
            cine.dibujarRayo(6, 70, 15, 150, 14, 1)
            lienzoPantalla.fillCircle(6, 70, 22 + fotograma * 5, 13)
            lienzoPantalla.fillCircle(6, 70, 14 + fotograma * 5, 1)
            lienzoPantalla.drawTransparentImage(heroeSilueta, 84 - fotograma * 10, 78)
            dibujarCoronaPequena(88 - fotograma * 10, 75)
            // la película se cierra despacio alrededor de la silueta
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA + fotograma * 2)
            esperar(120)
        }
        // 4) La luz inunda el salón.
        for (let fotograma = 0; fotograma < 6; fotograma++) {
            if (saltoPedido) {
                break
            }
            lienzoPantalla.fillCircle(6, 70, 20 + fotograma * 32, 1)
            cine.dibujarMarco(0, 0, 22)
            esperar(110)
        }
        // 5) Final en blanco: la riada de luz se enfría pasando por oro, rojo, marrón y gris hasta el negro, con el
        // mismo eco que en la tarjeta del estudio (intro.animarTarjetaEstudio). Se cierra el paréntesis.
        lienzoPantalla.fill(1)
        for (let fotograma = 0; fotograma < 6; fotograma++) {
            if (saltoPedido) {
                break
            }
            cine.enfriar()
            cine.dibujarMarco(0, 0, 22)
            esperar(130)
        }
        // A partir de aquí, la música la toman las tarjetas finales.
        sonido.pararMusica()
        // 6) Tarjeta final 1: A SALVO. Se reproduce SIEMPRE, incluso tras pulsar A: es el premio de la victoria.
        sonido.sonarCreditos()
        let inicio = 0
        if (saltoPedido) {
            inicio = 3
        }
        for (let fotograma = inicio; fotograma < 4; fotograma++) {
            lienzoPantalla.fill(15)
            cine.dibujarRayos(80, 24, 130, fotograma % 2, 14, 10)
            intro.dibujarCorona(80, 20, fotograma % 2 == 0)
            textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.A_SALVO), 40, 5, 4, fuenteGrande)
            if (fotograma >= 1) {
                textoConBorde(lienzoPantalla,
                    catalogo.texto(catalogo.IdTexto.CORONA_VUELTA), 62, 13, 15, image.font8)
            }
            if (fotograma >= 2) {
                textoConBorde(lienzoPantalla, catalogo.formatear(catalogo.IdTexto.PUNTOS, info.score()),
                    74, 5, 15, image.font8)
            }
            if (fotograma >= 3) {
                textoConBorde(lienzoPantalla, catalogo.formatear(catalogo.IdTexto.PISOS,
                    piso), 86, 4, 15, image.font8)
            }
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            if (fotograma < 3) {
                // esperar en lugar de pause: una pulsación de A solo acelera la aparición; la imagen final
                // queda parada debajo
                esperar(220)
            }
        }
        pause(1400)
        // 7) Tarjeta final 2: CALLIOPE HACKER: exactamente la tarjeta del estudio de la intro (con la figura) y su
        // acorde de 2 segundos. El juego se abre y se cierra con la misma imagen y el mismo sonido, y el acorde llena
        // el largo rato quieto en lugar de dejarlo en silencio.
        sonido.sonarLogoQuieto()
        inicio = 0
        if (saltoPedido) {
            inicio = 5
        }
        for (let fotograma = inicio; fotograma < 6; fotograma++) {
            lienzoPantalla.fill(15)
            cine.dibujarRayos(80, 51, 110, fotograma % 2, 14, 8)
            textoConBorde(lienzoPantalla, "CALLIOPE", intro.NOMBRE_Y, 5, 4, fuenteGrande)
            textoConBorde(lienzoPantalla, "HACKER", intro.HACKER_Y, 4, 2, fuenteGrande)
            intro.dibujarHackerEnPlaca()
            if (fotograma % 2 == 0) {
                cine.dibujarDestello(26, intro.NOMBRE_Y + 4, 5, 1)
            } else {
                cine.dibujarDestello(134, intro.HACKER_Y + 10, 5, 1)
            }
            if (fotograma >= 2) {
                textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.GRACIAS),
                    intro.LINEA_Y, 13, 15, image.font8)
            }
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            if (fotograma < 5) {
                esperar(150)
            }
        }
        // Adrede más larga que la tarjeta 1: esta tarjeta es el último plano del juego y debe poder leerse con calma.
        pause(2600)
        // Se cierra el telón.
        for (let fotograma = 0; fotograma < 4; fotograma++) {
            cine.dibujarMarco(0, 0, 8 + fotograma * 17)
            pause(70)
        }
        // Recoger, guardar el récord y mostrar la pantalla de la victoria.
        sonido.pararMusica()
        spritePantalla.destroy()
        lienzoPantalla = null
        info.saveHighScore()
        game.over(true)
    }
}
