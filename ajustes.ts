// Ajustes: ¡cambia el juego aquí!
//
// Este archivo se ejecuta antes que los demás archivos del juego que dependen de él. En pxt.json solo los textos
// (textos.ts) y los menús (menus.ts) van antes.
//
// Puedes cambiar cada número de este archivo y probar el juego enseguida en el simulador.
//
// El nombre del juego va en dos líneas separadas por «|». Aparece en letras grandes en la tarjeta del título de la
// intro y en el letrero de madera de la pantalla del título, cada línea centrada.
namespace juego {
    export const TITULO = "CUEVA|REAL"  // Título en letras grandes; «|» separa las dos líneas
    export const LINEAS_TITULO = TITULO.split("|")
}
// Interruptores para buscar fallos en la consola de verdad.
//
// Con DIAGNOSTICO = true se muestran cuadrados de colores al arrancar. Cada paso del arranque tiene su color y se queda
// un momento en pantalla. Si el juego se para, la imagen se congela en el último color alcanzado: así se ve hasta dónde
// llegó el arranque. En el GameKit hace falta porque, cuando algo falla, la pantalla no muestra ningún código de error
// ni una cara triste, solo negro.
//
// Con OSCURIDAD = false se apaga la capa oscura que rodea al héroe (160 × 120 píxeles, unos 9,6 KB, pegada a la cámara;
// mira luz.ts). Sirve mucho para averiguar por qué la pantalla se queda negra.
let DIAGNOSTICO = false
let OSCURIDAD = true
// Con INTRO_ACTIVA = false se apaga la intro entera: la historia, la tarjeta del estudio con el título y los carteles
// del tutorial. Para probar el juego en sí te ahorra casi un minuto en cada arranque. Para buscar fallos del arranque,
// ponlo junto con DIAGNOSTICO = true.
let INTRO_ACTIVA = true

let VIDAS_INICIALES = 6
let VELOCIDAD_HEROE = 95
let VELOCIDAD_BOTAS = 25
// Tope de las mejoras de las botas. Sin él, los cofres se acumularían sin límite y el héroe sería
// imposible de controlar.
let VELOCIDAD_HEROE_MAX = 170
// Desde este grado los enemigos ya no van más rápido. El tope está puesto a propósito para que hasta el enemigo más
// veloz (el murciélago, 34 + 2 × grado = 74) siga más lento que el héroe (95): siempre debe ser posible huir. Como un
// grado dura PISOS_POR_GRADO pisos, el tope se alcanza en el piso 39. Los pisos más profundos se hacen difíciles con
// más enemigos y más trampas, no con más velocidad.
let GRADO_MAX = 20
// Cuántos pisos dura un grado de enemigos. Si el grado subiera en cada piso, los enemigos se volverían demasiado
// rápidos muy pronto. Con 2, la misma subida dura el doble.
let PISOS_POR_GRADO = 2

// A partir de qué piso aparece cada especie de enemigo. Así las especies nuevas llegan bien separados y la dificultad
// sube poco a poco. Los carteles del tutorial de la intro leen estos mismos valores, de modo que el tutorial y el juego
// nunca se contradicen.
let PISO_MURCIELAGO = 4
let PISO_MAGO = 7
let PISO_GUARDIAN = 10

// Segundo y tercer enemigo en la misma sala. En el piso indicado la probabilidad empieza en una décima y sube otra
// décima en cada piso, hasta el tope (también en décimas). Así la cosa se complica poco a poco y no de golpe.
let SEGUNDO_DESDE_PISO = 4
let SEGUNDO_MAX = 6
let TERCERO_DESDE_PISO = 12
let TERCERO_MAX = 4
// Freno de emergencia para la memoria y los fotogramas por segundo: nunca hay más enemigos que estos en un piso.
let ENEMIGOS_MAX = 18

// Trampas: una más cada PISOS_POR_TRAMPA pisos, hasta un máximo.
let PISOS_POR_TRAMPA = 2
let TRAMPAS_MAX = 10

// Jefe: vida = base + número de piso, con tope. Sin tope, el jefe tendría tanta vida en los pisos profundos que el
// combate sería solo aguantar a golpes.
let VIDA_JEFE_BASE = 14
let VIDA_JEFE_MAX = 40
// El jefe se enfada cuando solo le queda esta fracción de su vida (3 = el último tercio). Con una fracción en lugar de
// un número fijo, la furia ocupa siempre el mismo trozo del combate, sea cual sea la vida del jefe.
let FRACCION_FURIA_JEFE = 3

// Compensación por la profundidad: cada PISOS_POR_BONO_CORAZON pisos, en una décima más de las salas aparece un corazón
// en lugar de una moneda, hasta un máximo de BONO_CORAZON_MAX décimas más.
let PISOS_POR_BONO_CORAZON = 5
let BONO_CORAZON_MAX = 2

// En este piso espera el jefe final: el ladrón de la corona, con la corona robada en la cabeza y con toda su vida.
// Quien lo vence gana el juego: el héroe coge la corona y escapa (epilogo.ts). construirPiso pone al jefe en este piso
// siempre, aunque no sea múltiplo de PISOS_POR_JEFE.
let PISO_JEFE_FINAL = 15
let VELOCIDAD_BOLA_FUEGO = 135
let RECARGA_NORMAL_MS = 420
let RECARGA_RAPIDA_MS = 190
let PROTECCION_MS = 2000
let CUADRICULA_ANCHO = 26
let CUADRICULA_ALTO = 22
let LUZ_NORMAL = 46
let LUZ_ANTORCHA = 80
let ANTORCHA_MS = 12000
let PISOS_POR_JEFE = 5
// Tiempo (en milisegundos) que tarda en desvanecerse un enemigo vencido en una nubecita de estrellas.
let NUBECITA_MS = 450
