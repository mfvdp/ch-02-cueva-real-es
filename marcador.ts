// Marcador: el número del piso y el mapa general (botón B).
//
// IMPORTANTE: las dos imágenes se crean UNA vez al arrancar (crearMarcadores, llamada desde main.ts) y después solo se
// repintan. Si la imagen del mapa se creara en cada pulsación de B y el indicador del piso en cada cambio de piso, la
// memoria del Calliope, que es escasa, se rompería en trozos hasta que una creación fallara a mitad de partida: pánico
// y imagen congelada.

let marcadorPiso: Sprite = null
let spriteMapa: Sprite = null

// Lado de un mosaico de la mazmorra en el mapa general (en píxeles)
const MAPA_LADO_CELDA = 4
// Margen de arriba del mapa; encima va el título
const MAPA_MARGEN_ARRIBA = 12

// Crea las dos imágenes del marcador: una vez, al arrancar, mientras la memoria todavía está de una pieza.
function crearMarcadores() {
    imagenMapa = image.create(CUADRICULA_ANCHO * MAPA_LADO_CELDA +
        4, CUADRICULA_ALTO * MAPA_LADO_CELDA + MAPA_MARGEN_ARRIBA + 2)
    imagenPiso = image.create(60, 10)
}

// Escribe el piso actual abajo a la izquierda, en el marcador.
function mostrarPiso() {
    // La fuente image.font8 gasta SEIS píxeles por letra. «PISO 12» son 7 caracteres y ocupa 42 píxeles. El ancho de la
    // imagen es de 60 píxeles. Si fuera más estrecha, lo que sobrara por la derecha se cortaría sin avisar.
    imagenPiso.fill(0)
    imagenPiso.print(catalogo.formatear(catalogo.IdTexto.PISO, piso), 0, 1, 5, image.font8)
    if (marcadorPiso == null) {
        marcadorPiso = sprites.create(imagenPiso, TIPO_MARCADOR)
        marcadorPiso.setFlag(SpriteFlag.Ghost, true)
        marcadorPiso.setFlag(SpriteFlag.RelativeToCamera, true)
        marcadorPiso.z = 100
        marcadorPiso.setPosition(32, 112)
    }
    // No hace falta setImage: el sprite muestra la misma imagen, así que lo que se pinta en ella cambia al instante lo
    // que se ve en pantalla.
}

// Pinta el mapa general del piso actual en la imagen fija.
function dibujarMapa() {
    let lienzo = imagenMapa
    lienzo.fill(15)
    lienzo.drawRect(0, 0, lienzo.width, lienzo.height, 12)
    lienzo.print(catalogo.formatear(catalogo.IdTexto.MAPA_PISO, piso), 3, 2, 5, image.font8)
    for (let fila = 0; fila < CUADRICULA_ALTO; fila++) {
        for (let columna = 0; columna < CUADRICULA_ANCHO; columna++) {
            let contenido = cuadricula[fila * CUADRICULA_ANCHO + columna]
            let color = -1
            if (contenido == 1) {
                color = 12
            } else if (contenido == 2) {
                color = 5
            } else if (contenido == 3) {
                color = 2
            }
            if (color >= 0) {
                lienzo.fillRect(2 + columna * MAPA_LADO_CELDA, MAPA_MARGEN_ARRIBA + fila * MAPA_LADO_CELDA,
                    MAPA_LADO_CELDA, MAPA_LADO_CELDA, color)
            }
        }
    }
    // El héroe, como un punto claro. Un mosaico de la mazmorra mide 16 píxeles de ancho.
    let columnaHeroe = Math.idiv(heroe.x, 16)
    let filaHeroe = Math.idiv(heroe.y, 16)
    if (columnaHeroe >= 0 && columnaHeroe < CUADRICULA_ANCHO && filaHeroe >= 0 && filaHeroe < CUADRICULA_ALTO) {
        lienzo.fillRect(2 + columnaHeroe * MAPA_LADO_CELDA, MAPA_MARGEN_ARRIBA + filaHeroe * MAPA_LADO_CELDA,
            MAPA_LADO_CELDA, MAPA_LADO_CELDA, 7)
    }
    return lienzo
}

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    // heroe y cuadricula no existen hasta main.ts y construirPiso, o sea, DESPUÉS de la pantalla del título. Pero este
    // manejador ya está activo durante la intro y el título, y el título incluso dice «B muestra el mapa». Sin esta
    // comprobación, dibujarMapa leería heroe == null (heroe.x es un getter, es decir, una llamada sobre una referencia
    // nula) y el juego se caería antes de empezar.
    if (heroe == null || cuadricula.length == 0 || !juegoActivo || spriteMapa != null) {
        return
    }
    spriteMapa = sprites.create(dibujarMapa(), TIPO_MARCADOR)
    spriteMapa.setFlag(SpriteFlag.Ghost, true)
    spriteMapa.setFlag(SpriteFlag.RelativeToCamera, true)
    spriteMapa.z = 200
    spriteMapa.setPosition(80, 60)
})

controller.B.onEvent(ControllerButtonEvent.Released, function () {
    if (spriteMapa != null) {
        spriteMapa.destroy()
        spriteMapa = null
    }
})
