// Pantalla del título: el muro de piedra, las antorchas, la imagen del título y la pantalla del título.
//
// Todo se dibuja al ejecutar el juego con rectángulos, círculos y líneas. No hay ni una sola imagen más en la memoria
// flash: solo se copian a la imagen del título, como decorado, los sprites que ya existen en graficos.ts.
//
// Las ayudas dibujarMuro(), dibujarSuelo(), dibujarAntorcha(), textoConBorde() y las dos escalas de color (colorPiedra
// y piedraMasOscura) también las usa la intro, en intro.ts.

// La escala de brillo de la luz de las antorchas:
//   13 (d) borde claro  ->  11 (b) piedra clara  ->  14 (e) marrón cálido  ->  12 (c) sombra  ->  15 (f) negro

// ¿Qué color de piedra corresponde a esta distancia a la antorcha?
function colorPiedra (distancia: number) {
    if (distancia < 30) {
        return 11
    }
    if (distancia < 56) {
        return 14
    }
    if (distancia < 86) {
        return 12
    }
    return 15
}

// Un escalón más oscuro en la misma escala.
function piedraMasOscura (color: number) {
    if (color == 13) {
        return 11
    }
    if (color == 11) {
        return 14
    }
    if (color == 14) {
        return 12
    }
    return 15
}

// Distancia aproximada entre dos puntos: el lado mayor más la mitad del menor. Es suficiente para la luz y mucho más
// barata que una raíz cuadrada.
function distanciaLuz (puntoX: number, puntoY: number, luzX: number, luzY: number) {
    let diferenciaX = valorAbsoluto(puntoX - luzX)
    let diferenciaY = valorAbsoluto(puntoY - luzY)
    if (diferenciaX > diferenciaY) {
        return diferenciaX + Math.idiv(diferenciaY, 2)
    }
    return diferenciaY + Math.idiv(diferenciaX, 2)
}

// Texto con borde oscuro: si no, el texto se perdería en el muro. El texto queda centrado en horizontal.
function textoConBorde (lienzo: Image, texto: string, y: number, color: number, colorBorde: number,
    fuente: image.Font) {
    let x = Math.idiv(lienzo.width - texto.length * fuente.charWidth, 2)
    lienzo.print(texto, x - 1, y, colorBorde, fuente)
    lienzo.print(texto, x + 1, y, colorBorde, fuente)
    lienzo.print(texto, x, y - 1, colorBorde, fuente)
    lienzo.print(texto, x, y + 1, colorBorde, fuente)
    lienzo.print(texto, x, y, color, fuente)
}

// Un muro de piedra desde y = desdeY hasta y = hastaY. antorchaIzqX y antorchaDerX son las dos antorchas a la altura
// antorchaY: las piedras cercanas a ellas se ven claras, y cuanto más lejos, más se hunde el muro en el negro.
function dibujarMuro (lienzo: Image, desdeY: number,
    hastaY: number, antorchaIzqX: number, antorchaDerX: number, antorchaY: number) {
    let fila = 0
    let desfase = 0
    let distancia = 0
    let distanciaOtra = 0
    let color = 0
    // Las juntas se quedan negras, por eso primero se pinta todo de negro.
    lienzo.fillRect(0, desdeY, lienzo.width, hastaY - desdeY, 15)
    for (let piedraY = desdeY; piedraY < hastaY; piedraY += 12) {
        desfase = 0
        if (fila % 2 == 1) {
            desfase = 11
        }
        for (let piedraX = desfase - 22; piedraX < lienzo.width; piedraX += 22) {
            distancia = distanciaLuz(piedraX + 10, piedraY + 5, antorchaIzqX, antorchaY)
            distanciaOtra = distanciaLuz(piedraX + 10, piedraY + 5, antorchaDerX, antorchaY)
            if (distanciaOtra < distancia) {
                distancia = distanciaOtra
            }
            color = colorPiedra(distancia)
            // Una de cada tres piedras es un poco más oscura, así el muro tiene más textura.
            if ((fila + Math.idiv(piedraX + 44, 22)) % 3 == 0) {
                color = piedraMasOscura(color)
            }
            lienzo.fillRect(piedraX, piedraY, 20, 10, color)
            if (color == 11) {
                lienzo.fillRect(piedraX, piedraY, 20, 1, 13)
                lienzo.fillRect(piedraX, piedraY + 9, 20, 1, 12)
            } else if (color == 14) {
                lienzo.fillRect(piedraX, piedraY, 20, 1, 4)
            }
            // De vez en cuando, una grieta
            if ((fila * 2 + Math.idiv(piedraX + 44, 22)) % 7 == 3 && color != 15) {
                lienzo.drawLine(piedraX + 5, piedraY + 1, piedraX + 8, piedraY + 8, 15)
            }
        }
        fila += 1
    }
}

// El suelo de piedra debajo del muro, también graduado según la luz de las antorchas. Es un poco más oscuro que la
// pared, para que no compita con ella.
function dibujarSuelo (lienzo: Image, desdeY: number, antorchaIzqX: number, antorchaDerX: number) {
    let fila = 0
    let desfase = 0
    let distancia = 0
    let distanciaOtra = 0
    lienzo.fillRect(0, desdeY, lienzo.width, lienzo.height - desdeY, 15)
    lienzo.fillRect(0, desdeY, lienzo.width, 2, 12)
    for (let baldosaY = desdeY + 3; baldosaY < lienzo.height; baldosaY += 9) {
        desfase = 0
        if (fila % 2 == 1) {
            desfase = 12
        }
        for (let baldosaX = desfase - 24; baldosaX < lienzo.width; baldosaX += 24) {
            distancia = distanciaLuz(baldosaX + 11, baldosaY + 4, antorchaIzqX, desdeY + 10)
            distanciaOtra = distanciaLuz(baldosaX + 11, baldosaY + 4, antorchaDerX, desdeY + 10)
            if (distanciaOtra < distancia) {
                distancia = distanciaOtra
            }
            lienzo.fillRect(baldosaX, baldosaY, 22, 7, piedraMasOscura(colorPiedra(distancia)))
        }
        fila += 1
    }
}

// Una antorcha de pared. centroX es el centro y alturaLlama la altura de la llama. parpadeo (0 o 1) mueve la punta de
// la llama: con dos imágenes fijas se consiguen los dos estados de una antorcha encendida.
function dibujarAntorcha (lienzo: Image, centroX: number, parpadeo: number = 0, alturaLlama: number = 42) {
    let puntaLlama = alturaLlama - 9 - parpadeo * 4
    // Mango y anillo de hierro en la pared
    lienzo.fillRect(centroX - 1, alturaLlama + 6, 3, 20, 14)
    lienzo.fillRect(centroX - 3, alturaLlama + 7, 7, 3, 11)
    lienzo.fillRect(centroX - 3, alturaLlama + 7, 7, 1, 13)
    // Llama: naranja por fuera, amarilla por dentro y blanca en el centro
    lienzo.fillCircle(centroX, alturaLlama + 3, 5, 4)
    lienzo.drawLine(centroX, puntaLlama, centroX - 4, alturaLlama + 3, 4)
    lienzo.drawLine(centroX, puntaLlama, centroX + 4, alturaLlama + 3, 4)
    lienzo.drawLine(centroX - 1 + parpadeo * 2, puntaLlama + 2, centroX - 3, alturaLlama + 3, 4)
    lienzo.fillCircle(centroX, alturaLlama + 2, 3, 5)
    lienzo.drawLine(centroX, puntaLlama + 4, centroX, alturaLlama + 2, 5)
    lienzo.fillCircle(centroX, alturaLlama + 1, 1, 1)
}

// Telarañas en las dos esquinas de arriba.
function dibujarTelaranas (lienzo: Image) {
    for (let lado = 0; lado < 2; lado++) {
        let bordeX = 0
        let direccion = 1
        if (lado == 1) {
            bordeX = lienzo.width - 1
            direccion = -1
        }
        lienzo.drawLine(bordeX, 0, bordeX + direccion * 19, 8, 11)
        lienzo.drawLine(bordeX, 0, bordeX + direccion * 13, 14, 11)
        lienzo.drawLine(bordeX, 0, bordeX + direccion * 7, 19, 11)
        lienzo.drawLine(bordeX + direccion * 9, 4, bordeX + direccion * 4, 9, 11)
        lienzo.drawLine(bordeX + direccion * 15, 7, bordeX + direccion * 7, 15, 11)
    }
}

// La imagen del título. mostrarPulsaA enseña el aviso «PULSA A» y parpadeo da el segundo estado de las antorchas: así
// el aviso parpadea junto con el fuego.
function imagenTitulo (mostrarPulsaA: boolean, parpadeo: number = 0) {
    let fuenteGrande = image.doubledFont(image.font8)
    lienzoPantalla = image.create(160, 120)
    lienzoPantalla.fill(15)
    // Muro, suelo y las dos antorchas, en los extremos
    dibujarMuro(lienzoPantalla, 0, 100, 14 - parpadeo * 2, 146 + parpadeo * 2, 46)
    dibujarSuelo(lienzoPantalla, 100, 14, 146)
    dibujarAntorcha(lienzoPantalla, 14, parpadeo, 46)
    dibujarAntorcha(lienzoPantalla, 146, parpadeo, 46)
    // Charcos de luz en el suelo, bajo las antorchas
    lienzoPantalla.fillRect(4 - parpadeo, 100, 21, 2, 4)
    lienzoPantalla.fillRect(9 - parpadeo, 100, 11, 1, 5)
    lienzoPantalla.fillRect(136 + parpadeo, 100, 21, 2, 4)
    lienzoPantalla.fillRect(141 + parpadeo, 100, 11, 1, 5)
    dibujarTelaranas(lienzoPantalla)
    // Dos cadenas sujetan el letrero al techo
    for (let cadenaY = 0; cadenaY < 12; cadenaY += 3) {
        lienzoPantalla.fillRect(45, cadenaY, 3, 2, 11)
        lienzoPantalla.fillRect(112, cadenaY, 3, 2, 11)
        lienzoPantalla.setPixel(45, cadenaY, 13)
        lienzoPantalla.setPixel(112, cadenaY, 13)
    }
    // Letrero de madera con el centro hundido
    lienzoPantalla.fillRect(22, 11, 116, 50, 14)
    lienzoPantalla.fillRect(22, 22, 116, 1, 12)
    lienzoPantalla.fillRect(22, 44, 116, 1, 12)
    lienzoPantalla.drawRect(22, 11, 116, 50, 15)
    lienzoPantalla.drawRect(23, 12, 114, 48, 4)
    lienzoPantalla.fillRect(28, 17, 104, 38, 15)
    lienzoPantalla.drawRect(28, 17, 104, 38, 12)
    lienzoPantalla.setPixel(25, 14, 5)
    lienzoPantalla.setPixel(134, 14, 5)
    lienzoPantalla.setPixel(25, 57, 5)
    lienzoPantalla.setPixel(134, 57, 5)
    // El rótulo brilla: la primera línea en letra amarilla con borde naranja, y la segunda en naranja con borde rojo.
    textoConBorde(lienzoPantalla, juego.LINEAS_TITULO[0], 19, 5, 4, fuenteGrande)
    textoConBorde(lienzoPantalla, juego.LINEAS_TITULO[1], 37, 4, 2, fuenteGrande)
    // Controles y récord
    //
    // Son dos líneas porque cada letra de font8 mide seis píxeles: en 160 píxeles de ancho caben solo 26 caracteres en
    // una línea. El marco del letrero llega hasta y = 60, por eso la primera línea empieza en 63 (su borde, en 62); si
    // no, las líneas del marco cruzarían la letra. El récord ocupa, con su borde, las filas 82 a 91, y justo debajo, en
    // la fila 92, está el héroe.
    textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.TITULO_CONTROLES), 63, 13, 15, image.font8)
    textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.TITULO_MAPA), 73, 13, 15, image.font8)
    textoConBorde(lienzoPantalla, catalogo.formatear(catalogo.IdTexto.RECORD,
        info.highScore()), 83, 5, 15, image.font8)
    // Decorado en el suelo: el héroe espera delante del cofre
    lienzoPantalla.drawTransparentImage(IMAGEN_COFRE, 14, 88)
    lienzoPantalla.drawTransparentImage(IMAGEN_LLAVE, 112, 92)
    lienzoPantalla.drawTransparentImage(DECORADO_HUESOS, 130, 106)
    lienzoPantalla.drawTransparentImage(IMAGEN_HEROE, 72, 92)
    if (mostrarPulsaA) {
        textoConBorde(lienzoPantalla, catalogo.texto(catalogo.IdTexto.PULSA_A), 105, 1, 15, image.font8)
    }
    return lienzoPantalla
}

// La pantalla del título: primero la intro (la historia, la tarjeta del estudio «Calliope Hacker presenta» con la
// tarjeta del título y los carteles del tutorial) y después espera a que se pulse A.
//
// El lienzo lienzoPantalla vive durante todas las partes de la intro: crearLienzo() lo crea y liberarLienzo() lo
// libera. Esto último TIENE que ejecutarse por TODOS los caminos, también tras salir con A; si no, a las dos imágenes
// del título les faltan 9,6 KB de memoria. Cada parte empieza con intro.iniciarParte(): una pulsación de A solo se
// salta la parte que está en curso (mira intro.ts).
function mostrarPantallaTitulo () {
    aPulsada = false
    // Tras el fin de la partida (reinicio con marca) se va directo a la imagen del título.
    if (INTRO_ACTIVA && !(catalogo.directoAlTitulo)) {
        intro.crearLienzo()
        intro.reproducir()
        intro.mostrarTarjetas()
        intro.iniciarParte(true)
        tutorial.reproducir()
        intro.liberarLienzo()
    }
    imagenTituloConPulsaA = imagenTitulo(true, 0)
    imagenTituloSimple = imagenTitulo(false, 1)
    // La imagen del título también es una parte: la pulsación que acaba de saltarse los carteles del tutorial ya no
    // cuenta, y durante el bloqueo posterior ni siquiera una A machacada empieza el juego.
    intro.iniciarParte(true)
    scene.setBackgroundImage(imagenTituloConPulsaA)
    sonido.iniciarMusicaTitulo()
    while (!(intro.pulsacionValida())) {
        pause(120)
        contadorParpadeo += 1
        if (contadorParpadeo % 6 == 0) {
            scene.setBackgroundImage(imagenTituloSimple)
        } else if (contadorParpadeo % 6 == 3) {
            scene.setBackgroundImage(imagenTituloConPulsaA)
        }
    }
    sonido.pararMusica()
    scene.setBackgroundImage(image.create(16, 16))
    // Las dos imágenes del título miden 160 × 120 cada una, casi 19 KB juntas, y no se vuelven a necesitar. Si no se
    // sueltan las referencias, ocupan memoria durante toda la partida, y con los 128 KB del Calliope eso se nota
    // bastante. lienzoPantalla apunta a la misma imagen que imagenTituloSimple.
    imagenTituloConPulsaA = null
    imagenTituloSimple = null
    lienzoPantalla = null
}
