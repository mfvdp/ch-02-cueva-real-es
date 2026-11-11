// Intro: la historia y la tarjeta del estudio antes de la imagen del título.
//
// La llama mostrarPantallaTitulo() de pantalla-titulo.ts y se ve cada vez que se enciende la consola (no al reiniciar
// tras el fin de la partida; mira catalogo.directoAlTitulo).
//
// La intro sigue este orden:
//   reproducir()       la historia del héroe:
//     1. Noche de tormenta: los relámpagos arrancan el castillo de la oscuridad.
//     2. La sala del tesoro: el ladrón roba la corona a la luz de la luna.
//     3. Travelling por el pasillo: sus ojos, su rastro de oro.
//     4. Se enciende una antorcha: «Su rastro acaba aquí».
//     5. La reja cae con estruendo y saltan astillas.
//     6. El juramento: la corona flota entre rayos de luz.
//   mostrarTarjetas()  la tarjeta del estudio «Calliope Hacker presenta» (animarTarjetaEstudio(), con la
//                      figura en su escritorio), después la tarjeta del título y el fundido a negro
//   tutorial.reproducir()   los carteles del tutorial (archivo propio, tutorial.ts)
//
// crearLienzo() crea UNA sola vez la pantalla completa lienzoPantalla para todas las partes, y liberarLienzo() hace el
// fundido a negro y la libera. Las dos las llama mostrarPantallaTitulo(), y entre una y otra lienzoPantalla no
// debe liberarse nunca.
//
// Con A se salta parte por parte: una pulsación durante la historia salta a la tarjeta del estudio, una pulsación en la
// tarjeta del estudio salta a la tarjeta del título, una pulsación en la tarjeta del título salta a los carteles del
// tutorial y una pulsación durante los carteles salta a la imagen del título. Cada parte empieza con iniciarParte():
// una pulsación vieja caduca y las pulsaciones de los primeros BLOQUEO_MS ms no cuentan; en la tarjeta del estudio son
// BLOQUEO_TARJETA_ESTUDIO_MS ms (1,5 s). El Calliope Hacker está allí desde el primer fotograma, así que quien sigue
// pulsando ya lo ha visto. El manejador de eventos.ts pone aPulsada solo al pulsar, nunca al mantener: quien mantiene A
// pulsada tiene que soltarla primero. Así, ni mantener ni machacar el botón se salta dos partes de golpe.
//
// Siempre se pinta en la misma pantalla completa lienzoPantalla, para que la memoria RAM no se llene de imágenes de 160
// × 120. La única imagen extra guardada en la memoria flash es el Calliope Hacker (IMAGEN_HACKER, en graficos.ts).
namespace intro {
    // Punto de fuga del travelling.
    const FUGA_X = 80
    const FUGA_Y = 54

    // Se pone en cuanto A cancela la parte en curso.
    let saltoPedido = false
    // ¿Se puede cancelar con A la parte en curso?
    let parteSaltable = true
    // Hasta esta hora (game.runtime) caduca cualquier pulsación.
    let bloqueoHastaMs = 0
    // Tanto tiempo (en ms) después de cambiar de parte no cuenta ninguna pulsación.
    const BLOQUEO_MS = 500
    // En la tarjeta «Calliope Hacker presenta», A cuenta solo pasados 1,5 s. La figura está allí desde el
    // primer fotograma (animarTarjetaEstudio()).
    const BLOQUEO_TARJETA_ESTUDIO_MS = 1500

    // Empieza una parte nueva: una pulsación vieja caduca y durante los siguientes BLOQUEO_MS ms no se cuentan
    // pulsaciones. saltable = false sirve para una parte que siempre se reproduce entera (ahora no hay ninguna).
    export function iniciarParte(saltable: boolean) {
        aPulsada = false
        saltoPedido = false
        parteSaltable = saltable
        bloqueoHastaMs = game.runtime() + BLOQUEO_MS
    }

    // Valora una pulsación: durante el bloqueo, o en una parte que no se puede saltar, caduca; en los demás casos
    // cancela la parte.
    function revisarPulsacion() {
        if (aPulsada) {
            if (parteSaltable && game.runtime() >= bloqueoHastaMs) {
                saltoPedido = true
            } else {
                aPulsada = false
            }
        }
    }

    // Para la imagen del título: ¿se ha hecho una pulsación válida desde iniciarParte()?
    export function pulsacionValida() {
        revisarPulsacion()
        return saltoPedido
    }

    // Pequeñas ayudas

    // Espera en trocitos pequeños y se fija en si se pulsa un botón.
    export function esperar(duracion: number) {
        let restante = duracion
        let trozo = 0
        while (restante > 0) {
            revisarPulsacion()
            if (saltoPedido) {
                return
            }
            trozo = 30
            if (restante < trozo) {
                trozo = restante
            }
            pause(trozo)
            restante = restante - trozo
        }
        revisarPulsacion()
    }

    // Muestra en pantalla lo que hay ahora en lienzoPantalla.
    export function mostrar() {
        scene.setBackgroundImage(lienzoPantalla)
    }

    // El diafragma de cine se cierra sobre la imagen parada. No hace falta volver a dibujar: las barras se comen la
    // última imagen de la escena. Es lo contrario de cine.altoBarraAbriendo().
    export function cerrarDiafragma() {
        for (let fotograma = 0; fotograma < 4; fotograma++) {
            if (saltoPedido) {
                return
            }
            cine.dibujarMarco(0, 0, 8 + fotograma * 17)
            mostrar()
            esperar(60)
        }
    }

    // El golpe: UNA sola imagen de blanco deslumbrante. Nunca dos: con dos saldría un efecto estroboscópico.
    export function destelloBlanco() {
        if (saltoPedido) {
            return
        }
        lienzoPantalla.fill(1)
        cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
        mostrar()
        esperar(60)
    }

    // Dice si A ha cancelado la parte en curso. Los carteles de tutorial.ts lo preguntan, pero no pueden leer
    // saltoPedido directamente: es privado en el espacio de nombres.
    export function fueSaltada() {
        return saltoPedido
    }

    // Crea la pantalla completa en la que se pinta toda la intro y empieza la primera parte (la historia).
    export function crearLienzo() {
        iniciarParte(true)
        lienzoPantalla = image.create(160, 120)
        lienzoPantalla.fill(15)
        scene.setBackgroundImage(lienzoPantalla)
    }

    // Hace el fundido a negro y libera la pantalla completa. Se ejecuta SIEMPRE, también si se canceló con A (solo se
    // salta el fundido: break, no return). Si no se liberara, quedarían 9,6 KB ocupados y las dos imágenes del título
    // encima reventarían la memoria.
    export function liberarLienzo() {
        for (let fotograma = 0; fotograma < 6; fotograma++) {
            if (saltoPedido) {
                break
            }
            oscurecer()
            mostrar()
            esperar(70)
        }
        sonido.pararMusica()
        scene.setBackgroundImage(image.create(16, 16))
        lienzoPantalla = null
    }

    // Pinta un sprite que ya existe al doble de tamaño en lienzoPantalla: así los carteles del tutorial no necesitan ni
    // una imagen más en la memoria flash. El color 0 es transparente y se queda sin pintar. pixelX y pixelY recorren
    // los píxeles de la imagen pequeña; destinoX y destinoY son la esquina de arriba a la izquierda en lienzoPantalla.
    export function dibujarDoble(imagen: Image, destinoX: number, destinoY: number) {
        let color = 0
        for (let pixelY = 0; pixelY < imagen.height; pixelY++) {
            for (let pixelX = 0; pixelX < imagen.width; pixelX++) {
                color = imagen.getPixel(pixelX, pixelY)
                if (color != 0) {
                    lienzoPantalla.fillRect(destinoX + pixelX * 2, destinoY + pixelY * 2, 2, 2, color)
                }
            }
        }
    }

    // Oscurece toda la imagen un escalón. El orden va de oscuro a claro; si no, un color caería de golpe por toda la
    // escala hasta el negro. El 8 y el 9 son los azules del héroe: desde que aparece en el último cartel del tutorial,
    // también él tiene que hundirse en el negro; si no, su cuerpo se quedaría claro durante el fundido.
    export function oscurecer() {
        lienzoPantalla.replace(12, 15)
        lienzoPantalla.replace(14, 12)
        lienzoPantalla.replace(2, 12)
        lienzoPantalla.replace(8, 12)
        lienzoPantalla.replace(11, 14)
        lienzoPantalla.replace(4, 14)
        lienzoPantalla.replace(13, 11)
        lienzoPantalla.replace(5, 4)
        lienzoPantalla.replace(1, 13)
        lienzoPantalla.replace(9, 8)
    }

    // La tarjeta del estudio «Calliope Hacker presenta»: CALLIOPE HACKER, después de la historia

    // Una palabra bajo un foco de luz que se desplaza: lo que queda cerca brilla, graduado según la distancia igual que
    // la luz de las antorchas (colorPiedra en pantalla-titulo.ts), pero con colores de brasa: 5, 4, 14 y 12.
    function dibujarPalabraLogo(palabra: string, altura: number, fuenteGrande: image.Font, luzX: number) {
        let inicioX = Math.idiv(160 - palabra.length * 12, 2)
        let distancia = 0
        let color = 0
        for (let letra = 0; letra < palabra.length; letra++) {
            distancia = valorAbsoluto(inicioX + letra * 12 + 6 - luzX)
            color = 12
            if (distancia < 46) {
                color = 14
            }
            if (distancia < 26) {
                color = 4
            }
            if (distancia < 12) {
                color = 5
            }
            lienzoPantalla.print(palabra.charAt(letra), inicioX + letra * 12, altura, color, fuenteGrande)
        }
    }

    // Alturas en la tarjeta del estudio: el nombre arriba, debajo el Calliope Hacker en su escritorio y abajo del todo
    // «presenta». También las usa la tarjeta final de epilogo.ts.
    export const NOMBRE_Y = 14
    export const HACKER_Y = 32
    export const LINEA_Y = 99
    const CENTRO_Y = 31

    // El Calliope Hacker en su placa: marco dorado (como el cuadro de la pared del juego), pared con el brillo del
    // monitor (color 12) y delante la figura de graficos.ts. Sin la placa, la sudadera negra se perdería en el fondo
    // negro. Se vuelve a pintar en CADA fotograma de la tarjeta, después de los efectos y antes del marco: así la
    // figura está quieta desde el primer fotograma y enfriar() no puede comérsela.
    export function dibujarHackerEnPlaca() {
        lienzoPantalla.fillRect(45, 52, 70, 43, 4)
        lienzoPantalla.fillRect(46, 53, 68, 41, 12)
        lienzoPantalla.setPixel(45, 52, 5)
        lienzoPantalla.setPixel(114, 52, 5)
        lienzoPantalla.drawTransparentImage(IMAGEN_HACKER, 48, 54)
    }

    // La tarjeta del estudio como una película corta, de unos cinco segundos. Va DESPUÉS de la historia, como tarjeta
    // «Calliope Hacker presenta». El Calliope Hacker está sentado en su escritorio sobre la placa desde el primer
    // fotograma (por eso no se abre el diafragma); encima se forma el rótulo: noche de estrellas, un punto se acerca a
    // toda velocidad, GOLPE, CALLIOPE HACKER queda al rojo blanco en el cráter, se enfría hasta el dorado, un foco de
    // luz lo recorre y por fin «presenta».
    export function animarTarjetaEstudio() {
        if (saltoPedido) {
            return
        }
        let fuenteGrande = image.doubledFont(image.font8)
        // Acto 1: noche de estrellas; un punto del cielo se va haciendo más grande.
        sonido.sonarAcercamiento()
        for (let fotograma = 0; fotograma < 2; fotograma++) {
            if (saltoPedido) {
                return
            }
            lienzoPantalla.fill(15)
            for (let estrella = 0; estrella < 30; estrella++) {
                lienzoPantalla.setPixel(randint(0, 159), randint(8, 111), 12)
            }
            for (let estrella = 0; estrella < 5; estrella++) {
                lienzoPantalla.setPixel(randint(0, 159), randint(8, 111), 13)
            }
            lienzoPantalla.fillCircle(20, 12 + fotograma * 3, 1 + fotograma, 13)
            dibujarHackerEnPlaca()
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            mostrar()
            esperar(320)
        }
        // Acto 2: la llegada: el meteoro arrastra su cola.
        for (let fotograma = 0; fotograma < 7; fotograma++) {
            if (saltoPedido) {
                return
            }
            let meteoroX = 20 + Math.idiv(60 * fotograma, 6)
            let meteoroY = 12 + Math.idiv((CENTRO_Y - 12) * fotograma, 6)
            lienzoPantalla.fill(15)
            for (let estrella = 0; estrella < 20; estrella++) {
                lienzoPantalla.setPixel(randint(0, 159), randint(8, 111), 12)
            }
            lienzoPantalla.drawLine(20, 12, meteoroX, meteoroY, 14)
            lienzoPantalla.drawLine(21, 13, meteoroX, meteoroY, 4)
            lienzoPantalla.fillCircle(meteoroX, meteoroY, fotograma + 3, 4)
            lienzoPantalla.fillCircle(meteoroX, meteoroY, fotograma + 1, 5)
            lienzoPantalla.fillCircle(meteoroX, meteoroY, Math.idiv(fotograma + 1, 2), 1)
            cine.dibujarChispas(meteoroX, meteoroY, 2, 6, 5)
            dibujarHackerEnPlaca()
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            mostrar()
            esperar(55)
        }
        // Acto 3: EL GOLPE, una sola imagen deslumbrante (como destelloBlanco(), pero con la figura en su placa).
        sonido.sonarImpacto()
        if (saltoPedido) {
            return
        }
        lienzoPantalla.fill(1)
        dibujarHackerEnPlaca()
        cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
        mostrar()
        esperar(60)
        // Acto 4: la onda de choque se expande y el nombre queda al rojo blanco en el cráter. dibujarOnda() tiene que
        // ir PRIMERO, porque vacía su centro; el marco va al FINAL.
        const COLORES_CRATER = [1, 1, 5, 5, 4]
        const COLORES_NUCLEO = [1, 1, 1, 5, 5]
        const COLORES_BORDE = [1, 1, 5, 5, 4]
        for (let fotograma = 0; fotograma < 5; fotograma++) {
            if (saltoPedido) {
                return
            }
            lienzoPantalla.fill(15)
            cine.dibujarOnda(80, CENTRO_Y, 20 + fotograma * 28, 1, 5, 4)
            cine.dibujarOnda(80, CENTRO_Y, 4 + fotograma * 22, 4, 14, 12)
            cine.dibujarRayos(80, CENTRO_Y, 40 + fotograma * 26, fotograma % 2, 5, 6)
            lienzoPantalla.fillCircle(80, CENTRO_Y, 16 - fotograma * 3, COLORES_CRATER[fotograma])
            textoConBorde(lienzoPantalla, "CALLIOPE",
                NOMBRE_Y, COLORES_NUCLEO[fotograma], COLORES_BORDE[fotograma], fuenteGrande)
            textoConBorde(lienzoPantalla, "HACKER",
                HACKER_Y, COLORES_NUCLEO[fotograma], COLORES_BORDE[fotograma], fuenteGrande)
            cine.dibujarChispas(80, CENTRO_Y, fotograma + 1, 12, 1)
            dibujarHackerEnPlaca()
            cine.sacudirMarco(fotograma, cine.ALTO_BARRA)
            mostrar()
            esperar(70)
        }
        // Acto 5: el ascua se enfría. NO hay fill(): la pantalla del acto 4 se queda como está, y enfriar() deja que
        // las ondas, los rayos y las chispas que quedan se apaguen solos, mientras las letras se repintan calientes
        // en cada fotograma.
        const COLORES_BRASA = [1, 1, 5, 5, 5, 5, 5]
        for (let fotograma = 0; fotograma < 7; fotograma++) {
            if (saltoPedido) {
                return
            }
            cine.enfriar()
            cine.dibujarChispas(80, CENTRO_Y, fotograma + 6, 12, 1)
            textoConBorde(lienzoPantalla, "CALLIOPE", NOMBRE_Y, COLORES_BRASA[fotograma], 4, fuenteGrande)
            textoConBorde(lienzoPantalla, "HACKER", HACKER_Y, COLORES_BRASA[fotograma], 2, fuenteGrande)
            if (fotograma >= 3) {
                // Sobre las palabras arden nueve llamitas (cuatro sobre CALLIOPE y cinco sobre HACKER)
                for (let llamaX = 62; llamaX <= 98; llamaX += 12) {
                    lienzoPantalla.drawLine(llamaX, NOMBRE_Y - 1, llamaX + randint(0 - 1, 1), NOMBRE_Y - 5, 4)
                    lienzoPantalla.setPixel(llamaX, NOMBRE_Y - 6, 5)
                }
                for (let llamaX = 56; llamaX <= 104; llamaX += 12) {
                    lienzoPantalla.drawLine(llamaX, HACKER_Y - 1, llamaX + randint(0 - 1, 1), HACKER_Y - 5, 4)
                    lienzoPantalla.setPixel(llamaX, HACKER_Y - 6, 5)
                }
            }
            dibujarHackerEnPlaca()
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            mostrar()
            esperar(120)
        }
        // Acto 6: el foco de luz recorre las palabras y el ascua del fondo sigue apagándose.
        sonido.sonarJingleEstudio()
        for (let luzX = 0 - 20; luzX <= 190; luzX += 22) {
            if (saltoPedido) {
                return
            }
            cine.enfriar()
            dibujarPalabraLogo("CALLIOPE", NOMBRE_Y, fuenteGrande, luzX)
            dibujarPalabraLogo("HACKER", HACKER_Y, fuenteGrande, luzX)
            dibujarHackerEnPlaca()
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            mostrar()
            esperar(55)
        }
        // Acto 7: imagen parada a contraluz, con el acorde del logo. 16 fotogramas × 130 ms son algo más de dos
        // segundos, y el acorde (2,0 s) suena casi hasta el final. Así se puede leer «presenta» de verdad.
        sonido.sonarLogoQuieto()
        for (let fotograma = 0; fotograma < 16; fotograma++) {
            if (saltoPedido) {
                return
            }
            cine.enfriar()
            cine.dibujarRayos(80, CENTRO_Y + 20, 100, fotograma % 2, 14, 8)
            textoConBorde(lienzoPantalla, "CALLIOPE", NOMBRE_Y, 5, 4, fuenteGrande)
            textoConBorde(lienzoPantalla, "HACKER", HACKER_Y, 4, 2, fuenteGrande)
            dibujarHackerEnPlaca()
            if (fotograma % 2 == 0) {
                cine.dibujarDestello(26, NOMBRE_Y + 4, 5, 1)
            } else {
                cine.dibujarDestello(134, HACKER_Y + 10, 5, 1)
            }
            if (fotograma >= 2) {
                textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.PRESENTA),
                    LINEA_Y, 13, 15, image.font8)
            }
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            mostrar()
            esperar(130)
        }
        cerrarDiafragma()
    }

    // Texto de la historia: dos líneas que se escriben fotograma a fotograma mientras la escena sigue por detrás.

    // Pinta el texto que toca en el fotograma fotograma: la línea 1 crece desde el primer fotograma y la línea 2
    // empieza ocho fotogramas después de que acabe la primera.
    function escribirHistoria(frase1: string, frase2: string, fotograma: number, linea1Y: number, linea2Y: number) {
        let letras1 = Math.min(fotograma + 1, frase1.length)
        let letras2 = fotograma + 1 - frase1.length - 8
        if (letras2 > frase2.length) {
            letras2 = frase2.length
        }
        lienzoPantalla.print(frase1.substr(0, letras1), Math.idiv(160 - frase1.length * 6, 2), linea1Y, 13, image.font8)
        if (letras2 > 0) {
            lienzoPantalla.print(frase2.substr(0, letras2),
                Math.idiv(160 - frase2.length * 6, 2), linea2Y, 13, image.font8)
        }
    }

    // Cuántos fotogramas necesitan las dos líneas, contando el tiempo para leerlas.
    function duracionHistoria(frase1: string, frase2: string) {
        return frase1.length + 8 + frase2.length + 16
    }

    // 1. Noche de tormenta sobre el castillo

    // Silueta del castillo sobre la colina, estrellas y lluvia. iluminado = un relámpago ilumina el cielo y el castillo
    // se recorta, negro, contra la pared brillante.
    function dibujarCastillo(iluminado: boolean) {
        lienzoPantalla.fill(15)
        if (iluminado) {
            lienzoPantalla.fillRect(0, 0, 160, 90, 13)
        } else {
            for (let estrella = 0; estrella < 14; estrella++) {
                lienzoPantalla.setPixel(randint(0, 159), randint(0, 58), 1)
            }
        }
        // la colina; con la luz del relámpago también ella se queda en silueta
        let colina = 12
        if (iluminado) {
            colina = 15
        }
        lienzoPantalla.fillCircle(80, 152, 76, colina)
        // Torre del homenaje, dos torres y almenas: todo en contorno negro
        lienzoPantalla.fillRect(64, 46, 32, 34, 15)
        lienzoPantalla.fillRect(52, 38, 12, 42, 15)
        lienzoPantalla.fillRect(96, 38, 12, 42, 15)
        for (let almenaX = 52; almenaX < 64; almenaX += 5) {
            lienzoPantalla.fillRect(almenaX, 33, 3, 6, 15)
        }
        for (let almenaX = 96; almenaX < 108; almenaX += 5) {
            lienzoPantalla.fillRect(almenaX, 33, 3, 6, 15)
        }
        for (let almenaX = 64; almenaX < 96; almenaX += 6) {
            lienzoPantalla.fillRect(almenaX, 41, 3, 6, 15)
        }
        // Bandera en la torre del homenaje
        lienzoPantalla.drawLine(80, 46, 80, 34, 15)
        lienzoPantalla.fillRect(81, 34, 6, 3, 2)
        // ventanas iluminadas: de noche, lo único que se ve
        lienzoPantalla.fillRect(70, 56, 3, 4, 5)
        lienzoPantalla.fillRect(84, 52, 3, 4, 5)
        lienzoPantalla.fillRect(56, 46, 2, 3, 5)
        lienzoPantalla.fillRect(100, 50, 2, 3, 5)
        // Lluvia, más clara con la luz del relámpago
        let colorLluvia = 12
        if (iluminado) {
            colorLluvia = 11
        }
        for (let gota = 0; gota < 26; gota++) {
            let gotaX = randint(0, 159)
            let gotaY = randint(0, 104)
            lienzoPantalla.drawLine(gotaX, gotaY, gotaX - 2, gotaY + 6, colorLluvia)
        }
        // Banco de niebla abajo: sobre él el texto se lee bien
        lienzoPantalla.fillRect(0, 92, 160, 28, 15)
        for (let niebla = 0; niebla < 20; niebla++) {
            lienzoPantalla.setPixel(randint(0, 159), 92 + randint(0, 3), 12)
        }
    }

    // Un relámpago: un camino en zigzag desde el cielo hasta una de las torres.
    function dibujarRelampago() {
        let torreX = 58
        if (randint(0, 1) == 1) {
            torreX = 102
        }
        let anteriorX = torreX + randint(0 - 30, 30)
        let anteriorY = 0
        let nuevoX = 0
        let nuevoY = 0
        for (let tramo = 1; tramo <= 4; tramo++) {
            nuevoX = torreX + randint(0 - 14, 14)
            nuevoY = Math.idiv(34 * tramo, 4)
            if (tramo == 4) {
                nuevoX = torreX
            }
            lienzoPantalla.drawLine(anteriorX, anteriorY, nuevoX, nuevoY, 1)
            lienzoPantalla.drawLine(anteriorX + 1, anteriorY, nuevoX + 1, nuevoY, 13)
            anteriorX = nuevoX
            anteriorY = nuevoY
        }
    }

    function reproducirEscenaCastillo() {
        if (saltoPedido) {
            return
        }
        let frase1 = catalogo.texto(catalogo.IdTexto.INTRO_1)
        let frase2 = catalogo.texto(catalogo.IdTexto.INTRO_2)
        let relampagosRestantes = 0
        let cercano = false
        let total = duracionHistoria(frase1, frase2)
        for (let fotograma = 0; fotograma < total; fotograma++) {
            if (saltoPedido) {
                return
            }
            // tres relámpagos, cada uno dura dos fotogramas; el tercero cae CERCA: una imagen blanca deslumbrante y la
            // cámara se sacude.
            if (relampagosRestantes == 0 && (fotograma == 5 || fotograma == 30 || fotograma == total - 8)) {
                relampagosRestantes = 2
                cercano = fotograma == total - 8
                sonido.sonarTrueno()
                if (cercano) {
                    sonido.sonarImpacto()
                }
            }
            dibujarCastillo(relampagosRestantes > 0)
            if (relampagosRestantes > 0) {
                dibujarRelampago()
                relampagosRestantes -= 1
            }
            escribirHistoria(frase1, frase2, fotograma, 94, 103)
            if (cercano && relampagosRestantes == 1) {
                lienzoPantalla.fill(1)
            }
            cine.sacudirMarco(8 - relampagosRestantes * 3, cine.altoBarraAbriendo(fotograma))
            mostrar()
            esperar(70)
        }
        cerrarDiafragma()
        esperar(900)
    }

    // 2. La sala del tesoro: el ladrón roba la corona

    // La corona: pintada, no es una imagen de la memoria flash. centroX es el centro y alturaPuntas la altura de las
    // puntas. conBrillo añade puntos de brillo. El epílogo también la usa para pintar el botín del ladrón de la corona.
    export function dibujarCorona(centroX: number, alturaPuntas: number, conBrillo: boolean) {
        lienzoPantalla.fillRect(centroX - 10, alturaPuntas + 4, 20, 5, 5)
        lienzoPantalla.fillRect(centroX - 10, alturaPuntas + 8, 20, 1, 4)
        lienzoPantalla.fillRect(centroX - 10, alturaPuntas, 4, 4, 5)
        lienzoPantalla.fillRect(centroX - 2, alturaPuntas - 3, 4, 7, 5)
        lienzoPantalla.fillRect(centroX + 6, alturaPuntas, 4, 4, 5)
        lienzoPantalla.fillRect(centroX - 1, alturaPuntas + 5, 2, 2, 2)
        if (conBrillo) {
            lienzoPantalla.setPixel(centroX + 3, alturaPuntas - 2, 1)
            lienzoPantalla.setPixel(centroX - 7, alturaPuntas + 2, 1)
        }
    }

    // La sala del tesoro: un rayo de luna cae sobre el pedestal. El rayo se ensancha hacia el suelo, con perspectiva de
    // verdad: dos trapecios en lugar de dos rectángulos.
    function dibujarSalaTesoro() {
        lienzoPantalla.fill(15)
        lienzoPantalla.fillPolygon4(70, 0, 94, 0, 104, 94, 60, 94, 14)
        lienzoPantalla.fillPolygon4(75, 0, 89, 0, 96, 94, 68, 94, 11)
        // El polvo baila en la luz
        for (let mota = 0; mota < 8; mota++) {
            lienzoPantalla.setPixel(randint(69, 94), randint(4, 88), 13)
        }
        // Suelo y pedestal
        lienzoPantalla.fillRect(0, 94, 160, 3, 12)
        lienzoPantalla.fillRect(74, 78, 16, 4, 11)
        lienzoPantalla.fillRect(77, 82, 10, 12, 12)
        lienzoPantalla.fillRect(72, 92, 20, 2, 11)
    }

    // El ladrón: una silueta negra con capucha y ojos rojos. centroX y centroY son el centro del cuerpo.
    function dibujarLadron(centroX: number, centroY: number) {
        // primero el borde gris y luego el negro de dentro
        lienzoPantalla.fillCircle(centroX, centroY - 10, 6, 12)
        lienzoPantalla.fillCircle(centroX, centroY, 9, 12)
        lienzoPantalla.fillRect(centroX - 9, centroY, 18, 12, 12)
        lienzoPantalla.fillCircle(centroX, centroY - 10, 5, 15)
        lienzoPantalla.fillCircle(centroX, centroY, 8, 15)
        lienzoPantalla.fillRect(centroX - 8, centroY, 16, 11, 15)
        // los ojos brillan
        lienzoPantalla.fillRect(centroX - 3, centroY - 11, 2, 2, 2)
        lienzoPantalla.fillRect(centroX + 1, centroY - 11, 2, 2, 2)
    }

    function reproducirEscenaLadron() {
        if (saltoPedido) {
            return
        }
        let frase1 = catalogo.texto(catalogo.IdTexto.INTRO_3)
        let frase2 = catalogo.texto(catalogo.IdTexto.INTRO_4)
        // la corona brilla sola a la luz de la luna
        for (let fotograma = 0; fotograma < 7; fotograma++) {
            if (saltoPedido) {
                return
            }
            dibujarSalaTesoro()
            dibujarCorona(82, 69, fotograma % 2 == 0)
            cine.dibujarMarco(0, 0, cine.altoBarraAbriendo(fotograma))
            mostrar()
            esperar(200)
        }
        // el ladrón se acerca a hurtadillas desde la derecha
        for (let fotograma = 0; fotograma < 9; fotograma++) {
            if (saltoPedido) {
                return
            }
            dibujarSalaTesoro()
            dibujarCorona(82, 69, fotograma % 3 == 0)
            dibujarLadron(146 - fotograma * 6, 82)
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            mostrar()
            esperar(100)
        }
        if (saltoPedido) {
            return
        }
        // ¡Zas! El rayo de luz se enciende, unos rayos se abren hacia abajo y la corona queda sobre la capucha.
        sonido.sonarHuida()
        dibujarSalaTesoro()
        lienzoPantalla.fillPolygon4(64, 0, 100, 0, 116, 94, 48, 94, 13)
        cine.dibujarRayo(82, 0, 3, 120, 20, 1)
        cine.dibujarRayo(82, 0, 4, 120, 24, 1)
        cine.dibujarRayo(82, 0, 5, 120, 20, 1)
        dibujarLadron(94, 82)
        dibujarCorona(94, 55, true)
        cine.dibujarDestello(94, 52, 8, 1)
        cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
        mostrar()
        esperar(280)
        // Huida hacia la izquierda; tras él saltan chispas doradas
        for (let fotograma = 0; fotograma < 6; fotograma++) {
            if (saltoPedido) {
                return
            }
            dibujarSalaTesoro()
            let centroX = 94 - (fotograma + 1) * 22
            dibujarLadron(centroX, 82)
            dibujarCorona(centroX, 55, true)
            cine.dibujarDestello(centroX, 55, 5, 1)
            lienzoPantalla.drawLine(centroX + 12, 74, centroX + 30, 74, 12)
            lienzoPantalla.drawLine(centroX + 14, 84, centroX + 32, 84, 12)
            for (let chispa = 0; chispa < 5; chispa++) {
                lienzoPantalla.setPixel(centroX + 12 + randint(0, 40), 60 + randint(0, 30), 5)
            }
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            mostrar()
            esperar(80)
        }
        // el pedestal vacío se queda atrás; las líneas del texto se escriben solas
        let total = duracionHistoria(frase1, frase2)
        for (let fotograma = 0; fotograma < total; fotograma++) {
            if (saltoPedido) {
                return
            }
            dibujarSalaTesoro()
            escribirHistoria(frase1, frase2, fotograma, 96, 104)
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            mostrar()
            esperar(70)
        }
        cerrarDiafragma()
        esperar(900)
    }

    // 6. El juramento: la corona entre rayos de luz

    // La corona robada flota en una cúpula de luz: 16 rayos de luz en dos círculos de rayos que parecen girar
    // en sentidos contrarios.
    function dibujarJuramento(fotograma: number) {
        lienzoPantalla.fill(15)
        cine.dibujarRayos(80, 36, 62, fotograma % 2, 4, 6)
        cine.dibujarRayos(80, 36, 40, 1 - fotograma % 2, 5, 3)
        let radio = 16 + (fotograma % 2) * 2
        lienzoPantalla.fillCircle(80, 36, radio, 4)
        lienzoPantalla.fillCircle(80, 36, radio - 2, 15)
        dibujarCorona(80, 30, fotograma % 2 == 0)
        if (fotograma % 2 == 0) {
            cine.dibujarDestello(80, 30, 7, 1)
        }
        // Chispas doradas bailan alrededor de la corona
        for (let chispa = 0; chispa < 6; chispa++) {
            lienzoPantalla.setPixel(80 + randint(0 - 26, 26), 36 + randint(0 - 20, 20), 5)
        }
    }

    function reproducirEscenaJuramento() {
        if (saltoPedido) {
            return
        }
        let frase1 = catalogo.texto(catalogo.IdTexto.INTRO_5)
        let frase2 = catalogo.texto(catalogo.IdTexto.INTRO_6)
        sonido.sonarJingleEstudio()
        let total = duracionHistoria(frase1, frase2)
        for (let fotograma = 0; fotograma < total; fotograma++) {
            if (saltoPedido) {
                return
            }
            dibujarJuramento(fotograma)
            escribirHistoria(frase1, frase2, fotograma, 78, 94)
            cine.dibujarMarco(0, 0, cine.altoBarraAbriendo(fotograma))
            mostrar()
            esperar(70)
        }
        cerrarDiafragma()
        esperar(400)
    }

    // 7. La tarjeta del título con el nombre del juego
    // Con la misma gramática que la tarjeta del estudio (animarTarjetaEstudio): golpe, onda, brasa. Es el broche en
    // mitad de la película.
    function reproducirEscenaTitulo() {
        if (saltoPedido) {
            return
        }
        let fuenteGrande = image.doubledFont(image.font8)
        // a) La cúpula de luz se forma desde el negro.
        for (let fotograma = 0; fotograma < 3; fotograma++) {
            if (saltoPedido) {
                return
            }
            lienzoPantalla.fill(15)
            cine.dibujarRayos(80, 46, 60 + fotograma * 30, fotograma % 2, 14, 8 + fotograma * 4)
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            mostrar()
            esperar(100)
        }
        // b) El golpe.
        sonido.sonarImpacto()
        destelloBlanco()
        // c) Onda de choque; el título queda al rojo blanco.
        const COLORES_TITULO = [1, 1, 5, 5]
        const COLORES_BORDE_TITULO = [1, 5, 5, 4]
        for (let fotograma = 0; fotograma < 4; fotograma++) {
            if (saltoPedido) {
                return
            }
            lienzoPantalla.fill(15)
            cine.dibujarOnda(80, 46, 22 + fotograma * 30, 1, 5, 4)
            cine.dibujarRayos(80, 46, 60 + fotograma * 22, fotograma % 2, 4, 8)
            textoConBorde(lienzoPantalla,
                juego.LINEAS_TITULO[0], 30, COLORES_TITULO[fotograma], COLORES_BORDE_TITULO[fotograma], fuenteGrande)
            textoConBorde(lienzoPantalla,
                juego.LINEAS_TITULO[1], 50, COLORES_TITULO[fotograma], COLORES_BORDE_TITULO[fotograma], fuenteGrande)
            cine.dibujarChispas(80, 46, fotograma + 1, 12, 1)
            cine.sacudirMarco(fotograma, cine.ALTO_BARRA)
            mostrar()
            esperar(80)
        }
        // d) Enfriamiento e imagen parada con fanfarria.
        sonido.sonarFanfarria()
        for (let fotograma = 0; fotograma < 6; fotograma++) {
            if (saltoPedido) {
                return
            }
            cine.enfriar()
            textoConBorde(lienzoPantalla, juego.LINEAS_TITULO[0], 30, 5, 4, fuenteGrande)
            textoConBorde(lienzoPantalla, juego.LINEAS_TITULO[1], 50, 4, 2, fuenteGrande)
            if (fotograma % 2 == 0) {
                cine.dibujarDestello(40, 34, 6, 1)
            } else {
                cine.dibujarDestello(120, 58, 6, 1)
            }
            if (fotograma >= 2) {
                textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.CREDITO), 78, 13, 15, image.font8)
            }
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            mostrar()
            esperar(160)
        }
        // No hay cerrarDiafragma(): fundirANegro() se encarga del fundido Y del cierre de las barras.
    }

    // 3. El travelling por el pasillo

    // Un anillo de pared: cuanto más grande, más cerca y más claro. contador alterna anillos oscuros y claros y decide
    // dónde van las antorchas.
    function dibujarAnilloPasillo(centroX: number, centroY: number, tamano: number, contador: number) {
        let mitadAlto = Math.idiv(tamano * 3, 4)
        let color = 15
        let antorchaX = 0
        let antorchaY = 0
        let radio = 0
        if (tamano > 95) {
            color = 11
        } else if (tamano > 46) {
            color = 14
        } else if (tamano > 20) {
            color = 12
        }
        if (contador % 2 == 1) {
            color = piedraMasOscura(color)
        }
        lienzoPantalla.fillRect(centroX - tamano, centroY - mitadAlto, tamano * 2, mitadAlto * 2, color)
        // en cada tercer anillo cuelga una antorcha a la izquierda y otra a la derecha
        if (tamano > 22 && contador % 3 == 1) {
            antorchaX = Math.idiv(tamano * 8, 10)
            antorchaY = centroY - Math.idiv(mitadAlto, 3)
            radio = Math.idiv(tamano, 14)
            if (radio < 1) {
                radio = 1
            }
            lienzoPantalla.fillCircle(centroX - antorchaX, antorchaY, radio + 2, 4)
            lienzoPantalla.fillCircle(centroX - antorchaX, antorchaY, radio, 5)
            lienzoPantalla.fillCircle(centroX + antorchaX, antorchaY, radio + 2, 4)
            lienzoPantalla.fillCircle(centroX + antorchaX, antorchaY, radio, 5)
        }
    }

    function reproducirEscenaPasillo() {
        if (saltoPedido) {
            return
        }
        // estiramiento va de 100 a 130 y luego empieza otra vez. Como los anillos están separados exactamente por un
        // factor de 1,3, el salto no se nota: solo se cuenta un ciclo más.
        let estiramiento = 100
        let aumento = 4
        let ciclo = 0
        let balanceo = 0
        let subida = 0
        let centroX = 0
        let centroY = 0
        let tamano = 0
        let anillo = 0
        for (let fotograma = 0; fotograma < 32; fotograma++) {
            if (saltoPedido) {
                return
            }
            lienzoPantalla.fill(15)
            // un ligero balanceo, como si alguien caminara de verdad
            balanceo = fotograma % 8
            if (balanceo > 4) {
                balanceo = 8 - balanceo
            }
            centroX = FUGA_X - 2 + balanceo
            subida = fotograma % 6
            if (subida > 3) {
                subida = 6 - subida
            }
            centroY = FUGA_Y - 1 + subida
            tamano = Math.idiv(300 * estiramiento, 100)
            anillo = 0
            while (tamano > 7) {
                dibujarAnilloPasillo(centroX, centroY, tamano, anillo + ciclo)
                tamano = Math.idiv(tamano * 10, 13)
                anillo = anillo + 1
            }
            // los bordes del pasillo corren hacia las cuatro esquinas
            lienzoPantalla.drawLine(0, 0, centroX, centroY, 15)
            lienzoPantalla.drawLine(159, 0, centroX, centroY, 15)
            lienzoPantalla.drawLine(0, 119, centroX, centroY, 15)
            lienzoPantalla.drawLine(159, 119, centroX, centroY, 15)
            // muy al fondo pasa el ladrón por la oscuridad: sus ojos rojos parpadean en el punto de fuga ...
            if (fotograma >= 12 && fotograma <= 26 && fotograma % 3 != 0) {
                lienzoPantalla.fillRect(centroX - 3, centroY - 2, 2, 2, 2)
                lienzoPantalla.fillRect(centroX + 2, centroY - 2, 2, 2, 2)
            }
            // ... y su botín va soltando chispas doradas
            if (fotograma >= 6) {
                for (let chispa = 0; chispa < 3; chispa++) {
                    lienzoPantalla.setPixel(centroX + randint(0 - 12, 12), centroY + randint(0 - 8, 8), 5)
                }
            }
            // la historia sigue como subtítulo bajo el travelling. UNA sola línea durante todo el recorrido: dos
            // seguidas iban demasiado rápido para leerlas.
            if (fotograma >= 8) {
                textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.INTRO_7), 96, 5, 15, image.font8)
            }
            // el balanceo que ya hay se convierte en cámara en mano: el marco se mueve de lado y ninguna coordenada de
            // la escena cambia
            cine.dibujarMarco(balanceo - 2, 0, cine.altoBarraAbriendo(fotograma))
            mostrar()
            esperar(55)
            estiramiento = estiramiento + aumento
            if (estiramiento >= 130) {
                estiramiento = estiramiento - 30
                ciclo = ciclo + 1
            }
            // cada vez se avanza más deprisa
            if (fotograma % 11 == 10) {
                aumento = aumento + 2
            }
        }
        if (saltoPedido) {
            return
        }
        // dejar quieta la última imagen un momento, para que la frase llegue
        esperar(800)
        cerrarDiafragma()
    }

    // 4. La estancia detrás del pasillo

    // Muro, suelo, arco de la puerta y dos antorchas.
    function dibujarEstancia(parpadeo: number) {
        dibujarMuro(lienzoPantalla, 0, 96, 28 - parpadeo * 2, 132 + parpadeo * 2, 42)
        dibujarSuelo(lienzoPantalla, 96, 28, 132)
        // Arco de la puerta: primero el marco de piedra y luego la negrura de dentro
        lienzoPantalla.fillRect(62, 38, 36, 58, 12)
        lienzoPantalla.fillCircle(80, 40, 18, 12)
        lienzoPantalla.fillRect(65, 41, 30, 55, 15)
        lienzoPantalla.fillCircle(80, 42, 15, 15)
        // dos escalones delante del arco
        lienzoPantalla.fillRect(66, 92, 28, 2, 12)
        lienzoPantalla.fillRect(62, 94, 36, 2, 11)
        dibujarAntorcha(lienzoPantalla, 28, parpadeo, 42)
        dibujarAntorcha(lienzoPantalla, 132, parpadeo, 42)
        // Charcos de luz en el suelo
        lienzoPantalla.fillRect(19, 96, 19, 2, 5)
        lienzoPantalla.fillRect(123, 96, 19, 2, 5)
        // Huesos sueltos en el polvo.
        lienzoPantalla.fillRect(40, 104, 11, 2, 1)
        lienzoPantalla.fillRect(44, 100, 2, 6, 1)
        lienzoPantalla.fillCircle(112, 107, 4, 13)
        lienzoPantalla.setPixel(110, 106, 15)
        lienzoPantalla.setPixel(114, 106, 15)
    }

    // Pone en negro una fila de la imagen, a izquierda y derecha del círculo de luz.
    function oscurecerFila(fila: number, centroX: number, mitadAncho: number) {
        let izquierda = centroX - mitadAncho
        if (izquierda > 0) {
            lienzoPantalla.fillRect(0, fila, izquierda, 1, 15)
        }
        let derecha = centroX + mitadAncho
        if (derecha < 160) {
            lienzoPantalla.fillRect(derecha, fila, 160 - derecha, 1, 15)
        }
    }

    // Todo lo que queda fuera del círculo se pinta de negro: así parece que la luz de la antorcha solo llega hasta ahí.
    // El cartel de la mazmorra de tutorial.ts también usa este círculo de luz.
    //
    // Solo con enteros, sin Math.sqrt: la mitad del ancho mitadAncho solo baja mientras crece la distancia
    // distanciaVertical al centro; nunca sube. Por eso, en toda la imagen bastan tantos pasos hacia abajo como indique
    // radio, en lugar de calcular 120 raíces cuadradas.
    export function dibujarIris(centroX: number, centroY: number, radio: number) {
        let radioCuadrado = radio * radio
        let mitadAncho = radio
        let fila = 0
        for (let distanciaVertical = 0; distanciaVertical < 120; distanciaVertical++) {
            while (mitadAncho > 0 && mitadAncho * mitadAncho + distanciaVertical * distanciaVertical > radioCuadrado) {
                mitadAncho = mitadAncho - 1
            }
            fila = centroY - distanciaVertical
            if (fila >= 0 && fila < 120) {
                oscurecerFila(fila, centroX, mitadAncho)
            }
            fila = centroY + distanciaVertical
            if (distanciaVertical > 0 && fila >= 0 && fila < 120) {
                oscurecerFila(fila, centroX, mitadAncho)
            }
        }
    }

    function reproducirEscenaEstancia() {
        if (saltoPedido) {
            return
        }
        let radio = 0
        sonido.sonarAntorcha()
        for (let fotograma = 0; fotograma < 18; fotograma++) {
            if (saltoPedido) {
                return
            }
            dibujarEstancia(fotograma % 2)
            // luz polvorienta de antorcha: dos rayos caen en la sala, y el iris los recorta enseguida al círculo de luz
            cine.dibujarRayo(28, 44, 3, 80, 12, 14)
            cine.dibujarRayo(132, 44, 5, 80, 12, 14)
            // la chispa tarda en prender y luego se hace luminosa de golpe
            radio = Math.idiv(fotograma * fotograma, 2) + randint(0, 3)
            if (radio > 135) {
                radio = 135
            }
            // el círculo de luz se desplaza de la antorcha izquierda hacia el centro
            dibujarIris(28 + Math.idiv(fotograma * 52, 17), 44, radio)
            cine.dibujarMarco(0, 0, cine.altoBarraAbriendo(fotograma))
            mostrar()
            esperar(60)
        }
        if (saltoPedido) {
            return
        }
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.INTRO_8), 100, 5, 15, image.font8)
        cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
        mostrar()
        esperar(700)
        if (saltoPedido) {
            return
        }
        // en el arco negro brillan un momento dos ojos rojos: la cámara da un respingo ...
        lienzoPantalla.fillRect(76, 58, 2, 2, 2)
        lienzoPantalla.fillRect(82, 58, 2, 2, 2)
        cine.sacudirMarco(3, cine.ALTO_BARRA)
        mostrar()
        esperar(400)
        // ... y ya no están
        lienzoPantalla.fillRect(76, 58, 2, 2, 15)
        lienzoPantalla.fillRect(82, 58, 2, 2, 15)
        cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
        mostrar()
        esperar(600)
        cerrarDiafragma()
        esperar(400)
    }

    // 5. La reja

    // La reja; alturaPuntas es la altura de las puntas de los barrotes.
    function dibujarReja(alturaPuntas: number) {
        // los travesaños horizontales bajan con ella
        for (let barraY = alturaPuntas - 118; barraY < alturaPuntas - 8; barraY += 30) {
            if (barraY > 0 - 5) {
                lienzoPantalla.fillRect(0, barraY, 160, 5, 11)
                lienzoPantalla.fillRect(0, barraY, 160, 1, 13)
                lienzoPantalla.fillRect(0, barraY + 4, 160, 1, 12)
            }
        }
        // los barrotes verticales con sus puntas
        for (let barraX = 5; barraX < 158; barraX += 14) {
            lienzoPantalla.fillRect(barraX, 0, 5, alturaPuntas - 5, 11)
            lienzoPantalla.fillRect(barraX, 0, 1, alturaPuntas - 5, 13)
            lienzoPantalla.fillRect(barraX + 4, 0, 1, alturaPuntas - 5, 12)
            lienzoPantalla.drawLine(barraX, alturaPuntas - 5, barraX + 2, alturaPuntas, 11)
            lienzoPantalla.drawLine(barraX + 4, alturaPuntas - 5, barraX + 2, alturaPuntas, 12)
            lienzoPantalla.drawLine(barraX + 1, alturaPuntas - 5, barraX + 2, alturaPuntas - 1, 13)
        }
    }

    // Polvo que salta con el golpe.
    function dibujarPolvo(fotograma: number) {
        let altura = 6 + fotograma * 4
        for (let mota = 0; mota < 20; mota++) {
            lienzoPantalla.fillRect(randint(0, 155), 112 - randint(0, altura), 3, 2, 11)
        }
    }

    function reproducirEscenaReja() {
        if (saltoPedido) {
            return
        }
        let alturaPuntas = 0
        let fotogramaCaida = 0
        // La reja cae con estruendo y detrás quedan estelas de velocidad.
        for (alturaPuntas = 10; alturaPuntas < 118; alturaPuntas += 13) {
            if (saltoPedido) {
                return
            }
            dibujarEstancia(alturaPuntas % 2)
            dibujarReja(alturaPuntas)
            for (let barraX = 7; barraX < 158; barraX += 14) {
                lienzoPantalla.drawLine(barraX, alturaPuntas - 26, barraX, alturaPuntas - 10, 13)
            }
            cine.dibujarMarco(0, 0, cine.altoBarraAbriendo(fotogramaCaida))
            fotogramaCaida += 1
            mostrar()
            esperar(30)
        }
        sonido.sonarPuertaCerrada()
        sonido.sonarImpacto()
        // EL GOLPE: una imagen blanca deslumbrante.
        destelloBlanco()
        // Impacto: la reja rebota una vez, vuela el polvo, llueven astillas de piedra, una onda de choque de piedra se
        // aleja del suelo y la cámara se sacude y luego se calma.
        for (let fotograma = 0; fotograma < 6; fotograma++) {
            if (saltoPedido) {
                return
            }
            alturaPuntas = 118
            if (fotograma == 1) {
                alturaPuntas = 112
            }
            dibujarEstancia(fotograma % 2)
            dibujarReja(alturaPuntas)
            dibujarPolvo(fotograma)
            for (let piedrecita = 0; piedrecita < 8; piedrecita++) {
                lienzoPantalla.fillRect(randint(0, 157), randint(0, 24) + fotograma * 14, 2, 2, 12)
            }
            // La piedra suelta chispas grises, no doradas
            cine.dibujarAnillo(80, 118, 24 + fotograma * 22, 11)
            cine.dibujarChispas(80, 114, fotograma + 1, 12, 11)
            cine.sacudirMarco(fotograma, cine.ALTO_BARRA)
            mostrar()
            esperar(70)
        }
        // Palabras finales detrás de los barrotes: primero la amenaza y después la respuesta desafiante del héroe.
        // Cuatro fotogramas de 300 ms para cada frase: tiempo de sobra para leer las dos.
        for (let fotograma = 0; fotograma < 8; fotograma++) {
            if (saltoPedido) {
                return
            }
            dibujarEstancia(fotograma % 2)
            dibujarReja(118)
            if (fotograma < 4) {
                textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.INTRO_9), 100, 2, 15, image.font8)
            } else {
                textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.INTRO_10), 100, 5, 15, image.font8)
            }
            cine.dibujarMarco(0, 0, cine.ALTO_BARRA)
            mostrar()
            esperar(300)
        }
        cerrarDiafragma()
    }

    // 8. Cierre
    function fundirANegro() {
        if (saltoPedido) {
            return
        }
        for (let fotograma = 0; fotograma < 6; fotograma++) {
            oscurecer()
            // las barras de cine se cierran con el fundido a negro
            cine.dibujarMarco(0, 0, 8 + fotograma * 10)
            mostrar()
            esperar(70)
            if (saltoPedido) {
                return
            }
        }
    }

    // Reproduce la historia. Una pulsación de A salta a la tarjeta del estudio. crearLienzo() crea la pantalla completa
    // y la primera parte.
    export function reproducir() {
        sonido.iniciarMusicaIntro()
        reproducirEscenaCastillo()
        reproducirEscenaLadron()
        reproducirEscenaPasillo()
        reproducirEscenaEstancia()
        reproducirEscenaReja()
        reproducirEscenaJuramento()
    }

    // La tarjeta del estudio «Calliope Hacker presenta» con la figura, y después la tarjeta del título y el fundido a
    // negro. Son dos partes: una pulsación en la tarjeta del estudio (desde BLOQUEO_TARJETA_ESTUDIO_MS ms) salta a la
    // tarjeta del título y una pulsación en la tarjeta del título (desde BLOQUEO_MS ms) salta a los carteles del
    // tutorial. La tarjeta del estudio tiene su propio sonido, así que la música de la intro calla debajo; vuelve a
    // sonar con la tarjeta del título y acompaña a los carteles, y liberarLienzo() la detiene.
    export function mostrarTarjetas() {
        iniciarParte(true)
        bloqueoHastaMs = game.runtime() + BLOQUEO_TARJETA_ESTUDIO_MS
        sonido.pararMusica()
        animarTarjetaEstudio()
        iniciarParte(true)
        sonido.iniciarMusicaIntro()
        reproducirEscenaTitulo()
        fundirANegro()
    }
}
