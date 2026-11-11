// Carteles de tutorial: el tutorial de la intro.
// Se reproduce después de la historia (intro.reproducir) y antes de la imagen del título. Seis carteles explican los
// controles, el objetivo, los tesoros, los enemigos y la mazmorra misma.
//
// Todo va por tiempo y A lo salta (como en la intro): cada bucle pregunta a intro.fueSaltada() y sale enseguida.
//
// Se pinta en la misma pantalla completa lienzoPantalla que en la intro: ninguna imagen nueva en la memoria flash y
// nada de RAM extra. Los sprites vienen de graficos.ts al doble de tamaño (intro.dibujarDoble); los símbolos (cruceta,
// botones, mapa, flecha) son solo dibujos de rectángulos y círculos.
//
// Ancho de letra: font5 y font8 gastan 6 píxeles por carácter. Una línea del cartel tiene como mucho 22 caracteres (de
// x = 14 a x = 145), así quedan 4 píxeles libres a la izquierda y a la derecha hasta el marco interior (x = 9 y
// x = 150); desde 24 caracteres, la letra queda encima del marco. A todo lo ancho de la pantalla caben 26. La línea de
// abajo está en y = 103: los rabitos de las letras (g, p) terminan en 110, el borde negro de la letra en 111, y el
// marco interior está en 112. Los textos vienen del catálogo (textos.ts), y cada uno tiene un tope de longitud ajustado
// a este espacio. Se permiten tildes y acentos, font8 los tiene.
//
// IMPORTANTE: este archivo tiene que estar en la lista files de pxt.json (después de intro.ts); si no, no se compila.
namespace tutorial {
    // Los valores del ritmo: PASO_MS es el cambio de imagen en milisegundos y FOTOGRAMAS el número de imágenes de un
    // cartel normal. 9 × 550 ms son unos 5 s por cartel: mejor demasiado lento que demasiado rápido; quien ya
    // terminó, pulsa A.
    const PASO_MS = 550
    const FOTOGRAMAS = 9
    // Cada aparición de un enemigo dura FOTOGRAMAS_ENEMIGO × PASO_ENEMIGO_MS, o sea, algo más de dos segundos: el
    // nombre y tres líneas piden su tiempo para leerse.
    const PASO_ENEMIGO_MS = 420
    const FOTOGRAMAS_ENEMIGO = 5

    // El cartel: pared de piedra con un campo negro en el centro. El marco interior brilla al ritmo de las antorchas, y
    // así el cartel tiene vida sin que la letra tiemble.
    function dibujarCartel(parpadeo: number) {
        dibujarMuro(lienzoPantalla, 0, 120, 6 - parpadeo * 2, 154 + parpadeo * 2, 58)
        lienzoPantalla.fillRect(8, 6, 144, 108, 15)
        lienzoPantalla.drawRect(8, 6, 144, 108, 12)
        lienzoPantalla.drawRect(9, 7, 142, 106, 11 + parpadeo * 2)
    }

    // Pequeños dibujos de símbolos

    // La cruceta, de 16 × 16.
    function dibujarCruceta(destinoX: number, destinoY: number) {
        lienzoPantalla.fillRect(destinoX + 5, destinoY, 6, 16, 11)
        lienzoPantalla.fillRect(destinoX, destinoY + 5, 16, 6, 11)
        lienzoPantalla.fillRect(destinoX + 6, destinoY + 1, 4, 14, 12)
        lienzoPantalla.fillRect(destinoX + 1, destinoY + 6, 14, 4, 12)
    }

    // Un botón redondo con su letra, de 16 × 16.
    function dibujarBoton(destinoX: number, destinoY: number, letra: string) {
        lienzoPantalla.fillCircle(destinoX + 8, destinoY + 8, 8, 12)
        lienzoPantalla.fillCircle(destinoX + 8, destinoY + 8, 7, 2)
        lienzoPantalla.print(letra, destinoX + 5, destinoY + 4, 1, image.font8)
    }

    // Un mapa pequeño con los colores del mapa de verdad (botón B): suelo gris, escalera amarilla y el héroe como un
    // punto verde (color 7).
    function dibujarIconoMapa(destinoX: number, destinoY: number) {
        lienzoPantalla.fillRect(destinoX, destinoY, 18, 14, 15)
        lienzoPantalla.drawRect(destinoX, destinoY, 18, 14, 12)
        lienzoPantalla.fillRect(destinoX + 2, destinoY + 2, 5, 4, 12)
        lienzoPantalla.fillRect(destinoX + 6, destinoY + 4, 4, 2, 12)
        lienzoPantalla.fillRect(destinoX + 9, destinoY + 6, 6, 5, 12)
        lienzoPantalla.setPixel(destinoX + 3, destinoY + 3, 7)
        lienzoPantalla.fillRect(destinoX + 12, destinoY + 8, 2, 2, 5)
    }

    // Una flecha hacia la derecha: va de la llave a la escalera.
    function dibujarFlecha(destinoX: number, destinoY: number, largo: number) {
        lienzoPantalla.fillRect(destinoX, destinoY - 1, largo, 3, 5)
        lienzoPantalla.drawLine(destinoX + largo, destinoY, destinoX + largo - 5, destinoY - 5, 5)
        lienzoPantalla.drawLine(destinoX + largo, destinoY, destinoX + largo - 5, destinoY + 5, 5)
    }

    // Cartel 1: los controles
    function dibujarCartelControles(parpadeo: number) {
        dibujarCartel(parpadeo)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.CONTROLES), 12, 5, 15, image.font8)
        dibujarCruceta(14, 26)
        lienzoPantalla.drawTransparentImage(IMAGEN_HEROE, 34, 26)
        lienzoPantalla.print(catalogo.texto(catalogo.IdTexto.ANDAR_APUNTAR), 56, 31, 13, image.font8)
        dibujarBoton(14, 50, "A")
        lienzoPantalla.drawTransparentImage(IMAGEN_BOLA_DE_FUEGO, 34, 50)
        lienzoPantalla.print(catalogo.texto(catalogo.IdTexto.BOLA_DE_FUEGO), 56, 55, 13, image.font8)
        dibujarBoton(14, 74, "B")
        dibujarIconoMapa(34, 75)
        lienzoPantalla.print(catalogo.texto(catalogo.IdTexto.MANTENER_MAPA), 56, 79, 13, image.font8)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.MIRADA_1), 94, 11, 15, image.font8)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.MIRADA_2), 104, 11, 15, image.font8)
    }

    // Cartel 2: el objetivo
    function dibujarCartelObjetivo(parpadeo: number) {
        dibujarCartel(parpadeo)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.OBJETIVO), 12, 5, 15, image.font8)
        intro.dibujarDoble(IMAGEN_LLAVE, 26, 26)
        dibujarFlecha(64, 42, 26)
        intro.dibujarDoble(MOSAICO_ESCALERA, 96, 26)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.BUSCAR_LLAVE), 62, 13, 15, image.font8)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.BAJAR_ESCALERA), 72, 13, 15, image.font8)
        textoConBorde(lienzoPantalla, catalogo.formatear(catalogo.IdTexto.CADA_N_PISOS,
            PISOS_POR_JEFE), 84, 13, 15, image.font8)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.JEFE_ESCALERA), 94, 13, 15, image.font8)
        textoConBorde(lienzoPantalla, catalogo.formatear(catalogo.IdTexto.CORONA_PISO, PISO_JEFE_FINAL),
            103, 5, 15, image.font8)
    }

    // Cartel 3: los tesoros
    function dibujarCartelTesoros(parpadeo: number) {
        dibujarCartel(parpadeo)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.TESOROS), 12, 5, 15, image.font8)
        lienzoPantalla.drawTransparentImage(IMAGEN_CORAZON, 16, 26)
        lienzoPantalla.print(catalogo.texto(catalogo.IdTexto.INFO_CORAZON), 40, 31, 13, image.font8)
        lienzoPantalla.drawTransparentImage(IMAGEN_ANTORCHA, 16, 46)
        lienzoPantalla.print(catalogo.texto(catalogo.IdTexto.INFO_ANTORCHA), 40, 51, 13, image.font8)
        lienzoPantalla.drawTransparentImage(IMAGEN_COFRE, 16, 66)
        lienzoPantalla.print(catalogo.texto(catalogo.IdTexto.INFO_COFRE), 40, 71, 13, image.font8)
        lienzoPantalla.drawTransparentImage(IMAGEN_MONEDA, 16, 86)
        lienzoPantalla.print(catalogo.texto(catalogo.IdTexto.INFO_MONEDA), 40, 91, 13, image.font8)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.RECOGER_TODO), 103, 5, 15, image.font8)
    }

    // Cartel 4: el desfile de enemigos
    // Imagen, nombre y avisos de cada enemigo con cadenas if: las listas costarían más, porque estarían en la RAM
    // durante todo el juego.
    function imagenEnemigo(especie: number) {
        if (especie == 1) {
            return IMAGEN_BABA
        }
        if (especie == 2) {
            return IMAGEN_MURCIELAGO
        }
        if (especie == 3) {
            return IMAGEN_MAGO
        }
        if (especie == 4) {
            return IMAGEN_GUARDIAN_IZQUIERDA
        }
        if (especie == 5) {
            return IMAGEN_JEFE
        }
        return IMAGEN_ESQUELETO
    }

    function nombreEnemigo(especie: number) {
        if (especie == 1) {
            return catalogo.texto(catalogo.IdTexto.BABA)
        }
        if (especie == 2) {
            return catalogo.texto(catalogo.IdTexto.MURCIELAGO)
        }
        if (especie == 3) {
            return catalogo.texto(catalogo.IdTexto.MAGO)
        }
        if (especie == 4) {
            return catalogo.texto(catalogo.IdTexto.GUARDIAN)
        }
        if (especie == 5) {
            return catalogo.texto(catalogo.IdTexto.JEFE)
        }
        return catalogo.texto(catalogo.IdTexto.ESQUELETO)
    }

    // Las líneas «Desde el piso N.» salen de las constantes de ajustes.ts: así el tutorial y el juego nunca se
    // contradicen, por mucho que se cambie el equilibrio.
    function lineaEnemigo(especie: number, numeroLinea: number) {
        if (especie == 0) {
            if (numeroLinea == 0) {
                return catalogo.texto(catalogo.IdTexto.SIGUE_SIN_PARAR)
            }
            if (numeroLinea == 1) {
                return catalogo.texto(catalogo.IdTexto.DOS_GOLPES)
            }
        } else if (especie == 1) {
            if (numeroLinea == 0) {
                return catalogo.texto(catalogo.IdTexto.LENTO_RESISTENTE)
            }
            if (numeroLinea == 1) {
                return catalogo.texto(catalogo.IdTexto.TRES_GOLPES)
            }
        } else if (especie == 2) {
            if (numeroLinea == 0) {
                return catalogo.texto(catalogo.IdTexto.ATRAVIESA_PAREDES)
            }
            if (numeroLinea == 1) {
                return catalogo.texto(catalogo.IdTexto.UN_GOLPE)
            }
            if (numeroLinea == 2) {
                return catalogo.formatear(catalogo.IdTexto.DESDE_PISO, PISO_MURCIELAGO)
            }
        } else if (especie == 3) {
            if (numeroLinea == 0) {
                return catalogo.texto(catalogo.IdTexto.MANTIENE_DISTANCIA)
            }
            if (numeroLinea == 1) {
                return catalogo.texto(catalogo.IdTexto.DISPARA)
            }
            if (numeroLinea == 2) {
                return catalogo.formatear(catalogo.IdTexto.DESDE_PISO, PISO_MAGO)
            }
        } else if (especie == 4) {
            if (numeroLinea == 0) {
                return catalogo.texto(catalogo.IdTexto.GOLPE_POR_DETRAS)
            }
            if (numeroLinea == 1) {
                return catalogo.texto(catalogo.IdTexto.SOLO_ESPALDA)
            }
            if (numeroLinea == 2) {
                return catalogo.formatear(catalogo.IdTexto.DESDE_PISO, PISO_GUARDIAN)
            }
        } else if (especie == 5) {
            if (numeroLinea == 0) {
                return catalogo.formatear(catalogo.IdTexto.JEFE_CADA, PISOS_POR_JEFE)
            }
            if (numeroLinea == 1) {
                return catalogo.texto(catalogo.IdTexto.JEFE_TIENE_LLAVE)
            }
            if (numeroLinea == 2) {
                return catalogo.texto(catalogo.IdTexto.SE_ENFADA)
            }
        }
        return ""
    }

    function dibujarCartelEnemigo(especie: number, parpadeo: number) {
        dibujarCartel(parpadeo)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.ENEMIGOS), 12, 5, 15, image.font8)
        intro.dibujarDoble(imagenEnemigo(especie), 64, 26)
        textoConBorde(lienzoPantalla, nombreEnemigo(especie), 62, 1, 15, image.font8)
        for (let numeroLinea = 0; numeroLinea < 3; numeroLinea++) {
            if (lineaEnemigo(especie, numeroLinea).length > 0) {
                textoConBorde(lienzoPantalla, lineaEnemigo(especie,
                    numeroLinea), 76 + numeroLinea * 10, 13, 15, image.font8)
            }
        }
    }

    // Cartel 5: la mazmorra misma. Junto con la despedida, es el único cartel sin pared de piedra ni marco: enseña la
    // vista real del juego, con su círculo de luz.
    function dibujarCartelMazmorra(parpadeo: number) {
        lienzoPantalla.fill(15)
        dibujarSuelo(lienzoPantalla, 30, 64, 64)
        lienzoPantalla.drawTransparentImage(MOSAICO_PINCHOS, 76, 40)
        lienzoPantalla.drawTransparentImage(IMAGEN_HEROE, 48, 40)
        // el círculo de luz respira un poco al ritmo de las antorchas
        intro.dibujarIris(64, 48, 32 + parpadeo * 2)
        // El texto va DESPUÉS del iris; si no, se pintaría de negro encima
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.LA_MAZMORRA), 8, 5, 15, image.font8)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.VISTA_CORTA), 76, 13, 15, image.font8)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.PINCHOS), 86, 13, 15, image.font8)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.AYUDA_ANTORCHA), 96, 13, 15, image.font8)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.AYUDA_MAPA), 106, 13, 15, image.font8)
    }

    // Cartel 6: el saludo final, una imagen fija.
    function dibujarCartelFinal() {
        lienzoPantalla.fill(15)
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.SUERTE), 44, 5, 4, image.font8)
        intro.dibujarDoble(IMAGEN_HEROE, 64, 68)
    }

    // Reproduce todos los carteles. A salta el resto de golpe.
    export function reproducir() {
        for (let fotograma = 0; fotograma < FOTOGRAMAS; fotograma++) {
            if (intro.fueSaltada()) {
                return
            }
            dibujarCartelControles(fotograma % 2)
            intro.mostrar()
            intro.esperar(PASO_MS)
        }
        for (let fotograma = 0; fotograma < 8; fotograma++) {
            if (intro.fueSaltada()) {
                return
            }
            dibujarCartelObjetivo(fotograma % 2)
            intro.mostrar()
            intro.esperar(PASO_MS)
        }
        for (let fotograma = 0; fotograma < FOTOGRAMAS; fotograma++) {
            if (intro.fueSaltada()) {
                return
            }
            dibujarCartelTesoros(fotograma % 2)
            intro.mostrar()
            intro.esperar(PASO_MS)
        }
        for (let especie = 0; especie <= 5; especie++) {
            for (let fotograma = 0; fotograma < FOTOGRAMAS_ENEMIGO; fotograma++) {
                if (intro.fueSaltada()) {
                    return
                }
                dibujarCartelEnemigo(especie, fotograma % 2)
                intro.mostrar()
                intro.esperar(PASO_ENEMIGO_MS)
            }
        }
        for (let fotograma = 0; fotograma < FOTOGRAMAS; fotograma++) {
            if (intro.fueSaltada()) {
                return
            }
            dibujarCartelMazmorra(fotograma % 2)
            intro.mostrar()
            intro.esperar(PASO_MS)
        }
        if (intro.fueSaltada()) {
            return
        }
        dibujarCartelFinal()
        intro.mostrar()
        intro.esperar(1500)
    }
}
