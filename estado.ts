// Estado global del juego. En MakeCode no hay import ni export: todo lo que está aquí se ve desde
// cualquier otro archivo.

// --- Progreso ---
let piso = 1
let cantidadLlaves = 0
let jefeActivo = false
let juegoActivo = true
// Bloqueo del aviso en la escalera: el manejador del mosaico se activa en cada fotograma mientras el héroe está encima.
// Esta hora (en ms) dice hasta cuándo no se repite el aviso.
let avisoHastaMs = 0

// --- Héroe ---
let heroe: Sprite = null
let velocidadHeroe = VELOCIDAD_HEROE
let miradaX = 1
let miradaY = 0
let recargaMs = RECARGA_NORMAL_MS
let disparoLibreDesdeMs = 0
let proteccionHastaMs = 0
let triple = false
let aPulsada = false

// --- Marcadores, luz y oscuridad ---
let marcadorLlave: Sprite = null
let capaOscura: Sprite = null
let radioLuz = 0
let luzHastaMs = 0
// Las dos imágenes del marcador (el mapa y el indicador del piso) se crean UNA sola vez al arrancar y después solo se
// repintan. Crearlas una y otra vez durante la partida trocearía la memoria hasta que una de las creaciones fallara: el
// juego se pararía y la imagen se congelaría (el recolector de basura de MakeCode limpia, pero no junta los huecos).
let imagenMapa: Image = null
let imagenPiso: Image = null

// --- Cuadrícula y salas ---
let cuadricula: number[] = []
let salaX: number[] = []
let salaY: number[] = []
let capaParedes: Image = null

// --- Enemigos ---
let listaEnemigos: Enemigo[] = []

// Variables auxiliares. Cada una solo hace falta en unas pocas funciones, pero aquí están a la vista de todo el
// programa, porque el juego se convirtió desde bloques a texto y las dejó así. Se han quedado para que el juego se
// comporte igual que antes.
let especieMaxima = 0
let ultimaSala = 0
let eleccionCofre = 0
let contadorParpadeo = 0
let vidaEnemigoNuevo = 0
let velocidadEnemigoNuevo = 0
let enemigoX = 0
let enemigoY = 0
let x = 0
let y = 0
let spriteEnemigoNuevo: Sprite = null
let bolaNueva: Sprite = null
let bolaMagicaNueva: Sprite = null
let enemigoTocado: Enemigo = null
let imagenOscuridad: Image = null
let lienzoPantalla: Image = null
let imagenEnemigoNuevo: Image = null
let imagenTituloConPulsaA: Image = null
let imagenTituloSimple: Image = null
// Las nubecitas de estrellas que se ven ahora mismo, de los enemigos vencidos (desvanecer, en eventos.ts). La lista
// está vacía en cuanto no queda ninguna.
let nubecitas: Sprite[] = []
