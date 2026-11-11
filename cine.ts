// Cine: la caja de herramientas para la intro y el epílogo.
//
// Cuatro gestos que se repiten en todas partes:
//   dibujarMarco()   barras, esquinas redondas y sacudida de cámara: en CADA fotograma
//   dibujarOnda()    la onda de choque de un impacto
//   dibujarRayo / dibujarRayos   rayos de luz
//   enfriar()        todo lo candente baja un escalón hacia el negro
//
// Siempre se pinta en la pantalla completa lienzoPantalla: aquí nunca se crea una imagen ni se espera. La espera y la
// comprobación de A se quedan en intro.esperar() y epilogo.esperar().
//
// Este espacio de nombres NO tiene estado propio: todo entra por los parámetros. Si no, algún día la imagen del título
// tendría barras de cine.
//
// SIN números decimales y sin funciones de ángulos. Todas las direcciones salen de las tablas
// DIRECCION_X y DIRECCION_Y.
namespace cine {
    // Alto normal de las barras. 8 arriba y 8 abajo de 120: parece una pantalla ancha, pero sin aplastar la imagen.
    // Queda visible de y = 8 a y = 111.
    export const ALTO_BARRA = 8

    // 16 direcciones sobre un círculo de radio 64, redondeadas a enteros (64 × coseno y 64 × seno en pasos de 22,5
    // grados). Un punto en la dirección k a la distancia r:
    //     x = centroX + Math.idiv(DIRECCION_X[k] * r, 64)
    // k + 4 es siempre la dirección girada 90 grados, y así el borde final de un rayo queda atravesado respecto a la
    // dirección en la que apunta el rayo.
    const DIRECCION_X = [64, 59, 45, 24, 0, -24, -45, -59, -64, -59, -45, -24, 0, 24, 45, 59]
    const DIRECCION_Y = [0, 24, 45, 59, 64, 59, 45, 24, 0, -24, -45, -59, -64, -59, -45, -24]

    // Cuántos píxeles quedan negros a izquierda y a derecha en cada fila (contada desde el borde de la barra): la
    // esquina redondeada del marco de cine.
    const ESQUINA_REDONDA = [10, 6, 4, 3, 2, 2, 1, 1]

    // Sacudida de cámara que se va apagando. El paso 0 es el golpe mismo.
    const SACUDIDA_X = [4, -3, 3, -2, 2, -1, 1, 0]
    const SACUDIDA_Y = [-3, 3, -2, 2, -1, 1, 0, 0]

    // Velocidades iniciales de las chispas: valores en píxeles, nada más.
    const CHISPA_VELOCIDAD_X = [-9, -7, -5, -2, 0, 2, 5, 7, 9, -4, 4, 0]
    const CHISPA_VELOCIDAD_Y = [-3, -6, -8, -9, -10, -9, -8, -6, -3, -7, -7, -11]

    // Colores del confeti. Úsalos SOLO en el epílogo (mira dibujarConfeti()).
    const COLORES_CONFETI = [5, 4, 1, 5, 2, 4, 3, 7, 10]

    // El marco de cine: barras arriba y abajo, un fino borde de luz y esquinas redondeadas. SIEMPRE es la ÚLTIMA orden
    // de dibujo de un fotograma.
    //
    // sacudidaX y sacudidaY no mueven la imagen, sino el DIAFRAGMA: con sacudidaY = 3 la barra de arriba crece y la de
    // abajo se encoge, y el ojo lo lee como un tirón de cámara. El truco no cuesta nada y ninguna escena tiene que
    // cambiar sus coordenadas. (lienzoPantalla.scroll() sería lo más obvio, pero con dy distinto de 0 crea por dentro
    // una copia de la imagen de 9,6 KB. No lo uses.)
    export function dibujarMarco(sacudidaX: number, sacudidaY: number, altoBarra: number) {
        let barraArriba = altoBarra + sacudidaY
        let barraAbajo = altoBarra - sacudidaY
        if (barraArriba < 0) {
            barraArriba = 0
        }
        if (barraAbajo < 0) {
            barraAbajo = 0
        }
        lienzoPantalla.fillRect(0, 0, 160, barraArriba, 15)
        lienzoPantalla.fillRect(0, 120 - barraAbajo, 160, barraAbajo, 15)
        if (sacudidaX > 0) {
            lienzoPantalla.fillRect(0, barraArriba, sacudidaX, 120 - barraArriba - barraAbajo, 15)
        }
        if (sacudidaX < 0) {
            lienzoPantalla.fillRect(160 + sacudidaX, barraArriba, 0 - sacudidaX, 120 - barraArriba - barraAbajo, 15)
        }
        // El borde de luz: sin él, la barra se confunde con una imagen negra y el marco ni se ve.
        if (barraArriba > 0) {
            lienzoPantalla.fillRect(0, barraArriba - 1, 160, 1, 12)
        }
        if (barraAbajo > 0) {
            lienzoPantalla.fillRect(0, 120 - barraAbajo, 160, 1, 12)
        }
        for (let fila = 0; fila < 8; fila++) {
            lienzoPantalla.fillRect(0, barraArriba + fila, ESQUINA_REDONDA[fila], 1, 15)
            lienzoPantalla.fillRect(160 - ESQUINA_REDONDA[fila], barraArriba + fila, ESQUINA_REDONDA[fila], 1, 15)
            lienzoPantalla.fillRect(0, 119 - barraAbajo - fila, ESQUINA_REDONDA[fila], 1, 15)
            lienzoPantalla.fillRect(160 - ESQUINA_REDONDA[fila], 119 - barraAbajo - fila, ESQUINA_REDONDA[fila], 1, 15)
        }
    }

    // Marco con sacudida de cámara del paso indicado: el 0 es el golpe mismo y cuanto más alto el número, más calma.
    // Con 8 o más, la cámara está quieta del todo.
    export function sacudirMarco(paso: number, altoBarra: number) {
        if (paso < 0 || paso > 7) {
            dibujarMarco(0, 0, altoBarra)
        } else {
            dibujarMarco(SACUDIDA_X[paso], SACUDIDA_Y[paso], altoBarra)
        }
    }

    // Alto de las barras en el fotograma número fotograma de una escena: los cuatro primeros fotogramas van abriendo el
    // diafragma. 59, 42, 25 y luego 8.
    export function altoBarraAbriendo(fotograma: number) {
        if (fotograma >= 3) {
            return ALTO_BARRA
        }
        return ALTO_BARRA + (3 - fotograma) * 17
    }

    // Una onda de choque: tres anillos de color de fuera hacia dentro, y el centro se vacía otra vez.
    //
    // Por eso: SOLO sobre fondo negro y SIEMPRE lo PRIMERO del fotograma. A cambio, con cuatro llamadas nativas a
    // fillCircle sale baratísima. drawCircle sería un error aquí: es un bucle de TypeScript que, por cada círculo,
    // llama unas 6 × r veces a setPixel a través del límite del shim.
    export function dibujarOnda(centroX: number, centroY: number,
        radio: number, colorExterior: number, colorMedio: number, colorInterior: number) {
        if (radio < 4) {
            return
        }
        lienzoPantalla.fillCircle(centroX, centroY, radio, colorExterior)
        lienzoPantalla.fillCircle(centroX, centroY, radio - 3, colorMedio)
        lienzoPantalla.fillCircle(centroX, centroY, radio - 6, colorInterior)
        lienzoPantalla.fillCircle(centroX, centroY, radio - 10, 15)
    }

    // Un anillo suelto, solo el contorno: la única manera de poner una onda ENCIMA de una imagen ya terminada. Es caro
    // (mira arriba), así que como mucho UNA llamada por fotograma y con radio de 120 como máximo.
    export function dibujarAnillo(centroX: number, centroY: number, radio: number, color: number) {
        if (radio < 1 || radio > 120) {
            return
        }
        lienzoPantalla.drawCircle(centroX, centroY, radio, color)
    }

    // Chispas en trayectoria de lanzamiento en el momento tiempo. Balística con enteros:
    //   x = centroX + CHISPA_VELOCIDAD_X * tiempo / 2, y = centroY + CHISPA_VELOCIDAD_Y * tiempo / 2 + tiempo * tiempo
    //   / 2 (la gravedad)
    // No hace falta que se desvanezcan: enfriar() convierte solas las chispas que se quedan en una estela de luz.
    // cantidad, como mucho 12.
    export function dibujarChispas(centroX: number, centroY: number, tiempo: number, cantidad: number, color: number) {
        for (let chispa = 0; chispa < cantidad; chispa++) {
            lienzoPantalla.setPixel(centroX + Math.idiv(CHISPA_VELOCIDAD_X[chispa] * tiempo, 2),
                centroY + Math.idiv(CHISPA_VELOCIDAD_Y[chispa] * tiempo, 2) + Math.idiv(tiempo * tiempo, 2), color)
        }
    }

    // Un rayo de luz: un triángulo que sale del origen hacia direccion (de 0 a 15). El borde final queda atravesado:
    // por eso se usa direccion + 4. fillTriangle es nativo y recorta él solo: largo puede pasarse tranquilamente del
    // borde de la imagen sin que pase nada.
    export function dibujarRayo(origenX: number, origenY: number, direccion: number,
        largo: number, ancho: number, color: number) {
        let puntaX = origenX + Math.idiv(DIRECCION_X[direccion % 16] * largo, 64)
        let puntaY = origenY + Math.idiv(DIRECCION_Y[direccion % 16] * largo, 64)
        let ladoX = Math.idiv(DIRECCION_X[(direccion + 4) % 16] * ancho, 64)
        let ladoY = Math.idiv(DIRECCION_Y[(direccion + 4) % 16] * ancho, 64)
        lienzoPantalla.fillTriangle(origenX, origenY, puntaX +
            ladoX, puntaY + ladoY, puntaX - ladoX, puntaY - ladoY, color)
    }

    // Ocho rayos de luz en círculo. fase 0 o 1 los gira media separación: pintados por turnos parece un giro lento,
    // sin calcular nada.
    export function dibujarRayos(centroX: number, centroY: number, largo: number, fase: number,
        color: number, ancho: number) {
        for (let direccion = fase; direccion < 16; direccion += 2) {
            dibujarRayo(centroX, centroY, direccion, largo, ancho, color)
        }
    }

    // Un destello de ocho puntas: una cruz más diagonales de media longitud. Cuatro líneas: el punto de brillo más
    // barato que hay.
    export function dibujarDestello(centroX: number, centroY: number, tamano: number, color: number) {
        let mitad = Math.idiv(tamano, 2)
        lienzoPantalla.drawLine(centroX - tamano, centroY, centroX + tamano, centroY, color)
        lienzoPantalla.drawLine(centroX, centroY - tamano, centroX, centroY + tamano, color)
        lienzoPantalla.drawLine(centroX - mitad, centroY - mitad, centroX + mitad, centroY + mitad, color)
        lienzoPantalla.drawLine(centroX - mitad, centroY + mitad, centroX + mitad, centroY - mitad, color)
    }

    // El metal candente se enfría: blanco -> amarillo -> naranja -> rojo -> marrón -> gris -> negro. Igual que en
    // intro.oscurecer(), el orden va de oscuro a claro; si no, un color caería de golpe por toda la escala.
    //
    // Es el efecto más importante de todo el cine: se pintan anillos, rayos y chispas UNA vez, se deja la pantalla como
    // está y en cada fotograma solo se llama a enfriar(). Todo se va apagando solo: un sistema de partículas sin una
    // sola variable de estado.
    //
    // CUIDADO: el 12 y el 14 también bajan, así que el muro se deshace. Úsalo solo en una pantalla que de todos modos
    // va hacia el negro. El 11 y el 13 sobreviven: lo que deba quedarse, píntalo en 13. NUNCA lo llames dos veces en
    // el mismo fotograma.
    export function enfriar() {
        lienzoPantalla.replace(12, 15)
        lienzoPantalla.replace(14, 12)
        lienzoPantalla.replace(2, 14)
        lienzoPantalla.replace(4, 2)
        lienzoPantalla.replace(5, 4)
        lienzoPantalla.replace(1, 5)
    }

    // Confeti que cae. Sin randint, para que caiga de verdad y no parpadee.
    //
    // SOLO EN EL EPÍLOGO. Aquí están los colores 3, 7 y 10, que intro.oscurecer() no conoce: en la intro, una mancha
    // así se quedaría clara durante el fundido. El epílogo nunca pasa por oscurecer(), por eso aquí está permitido.
    export function dibujarConfeti(fotograma: number) {
        for (let pieza = 0; pieza < 18; pieza++) {
            lienzoPantalla.fillRect(pieza * 9 + 4, (pieza * 27 +
                fotograma * 11) % 104 + 10, 2, 3, COLORES_CONFETI[pieza % 9])
        }
    }
}
