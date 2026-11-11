// Gráficos: todos los mosaicos, sprites e imágenes derivadas.
//
// Guía de colores para la mazmorra:
//   f negro = contornos, juntas, profundidad
//   c violeta oscuro = tono base del suelo y la roca
//   b malva grisáceo = piedra del muro, metal, piedra a la luz
//   d beige claro = borde brillante, piel
//   4/5/e = acentos cálidos (antorcha, oro, madera)
//
// Ahorro: cada literal img nuevo cuesta memoria flash. Por eso las variantes se crean al ejecutar el juego, con clone()
// más fillRect, drawLine y setPixel.
let MOSAICO_ESCALERA: Image = null
let MOSAICO_PINCHOS: Image = null
let IMAGEN_ESQUELETO: Image = null
let IMAGEN_BABA: Image = null
let IMAGEN_MURCIELAGO: Image = null
let IMAGEN_MAGO: Image = null
let IMAGEN_GUARDIAN_IZQUIERDA: Image = null
// Direcciones de mirada del guardián. Bloquea todo menos los golpes justo en la espalda (eventos.ts), así que el escudo
// TIENE que señalar bien hacia dónde está el frente; si no, nadie podría saber dónde estaría la «espalda».
let IMAGEN_GUARDIAN_DERECHA: Image = null
let IMAGEN_GUARDIAN_ARRIBA: Image = null
let IMAGEN_GUARDIAN_ABAJO: Image = null
let IMAGEN_JEFE: Image = null
let IMAGEN_CORAZON: Image = null
let IMAGEN_LLAVE: Image = null
let IMAGEN_MONEDA: Image = null
let IMAGEN_BOLA_DE_FUEGO: Image = null
let IMAGEN_COFRE: Image = null
let IMAGEN_ANTORCHA: Image = null
let IMAGEN_BOLA_MAGICA: Image = null
let DECORADO_BARRIL: Image = null
let DECORADO_HUESOS: Image = null
// Direcciones de mirada del héroe. IMAGEN_HEROE sigue siendo la imagen estándar.
let IMAGEN_HEROE_ABAJO: Image = null
let IMAGEN_HEROE_ARRIBA: Image = null
let IMAGEN_HEROE_IZQUIERDA: Image = null
let IMAGEN_HEROE_DERECHA: Image = null


// Muro de ladrillos a soga: las juntas están en y = 0, 4, 8 y 12, y las juntas verticales de cada hilera están
// desplazadas media piedra. Así los mosaicos encajan sin costuras, también por el borde.
let MOSAICO_PARED = img`
    f f f f f f f f f f f f f f f f
    d b b b b b b f d b b b b b b f
    b b b c b b b f b b b b b b b f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b f d b b b b b b f d b b b
    b b b f b b b c b b b f b b b b
    c c c f c c c c c c c f c c c c
    f f f f f f f f f f f f f f f f
    d b b b b b b f d b b b b b b f
    b b b b b b b f b b b c b b b f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b f d b b b b b b f d b b b
    b c b f b b b b b b b f b b c b
    c c c f c c c c c c c f c c c c
    `
// Losas de piedra gastadas: cuatro losas por mosaico; las juntas siguen más allá del borde del mosaico.
let MOSAICO_SUELO = img`
    b b c c c c c f b b b c c c c f
    c c c c c c c f c c c c c c c f
    c c c f c c c f c c c c c c c f
    c c c c c c c f c c c c f c c f
    c c c c c c c f c c c c c c c f
    c f c c c c c f c c c c c c c f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b c c c c f b b c c c c c f
    c c c c c c c f c c c c c c c f
    c c c c c f c f c c c f c c c f
    c c c c c c c f c c c c c c c f
    c c f c c c c f c c c c c c c f
    c c c c c c c f c c c c c f c f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    `
// Escalera: cinco escalones en perspectiva; estrechos y oscuros arriba, más anchos y claros hacia delante. Así se ve
// enseguida que se baja y que no es solo un dibujo de rayas.
MOSAICO_ESCALERA = img`
    f f f f f f f f f f f f f f f f
    f f f f f f b b b b f f f f f f
    f f f f f f c c c c f f f f f f
    f f f f f b b b b b b f f f f f
    f f f f f c c c c c c f f f f f
    f f f f f c c c c c c f f f f f
    f f f f b b b b b b b b f f f f
    f f f f c c c c c c c c f f f f
    f f f f c c c c c c c c f f f f
    f f f d d d d d d d d d d f f f
    f f f b b b b b b b b b b f f f
    f f f c c c c c c c c c c f f f
    f f d d d d d d d d d d d d f f
    f f b b b b b b b b b b b b f f
    f f c c c c c c c c c c c c f f
    f f f f f f f f f f f f f f f f
    `
// Héroe de frente: casco dorado y jubón azul con escudo de armas azul claro. Las cuatro direcciones de mirada tienen el
// mismo contorno (x 2 a 13, y 0 a 15), para que la zona de contacto no cambie al girar.
let IMAGEN_HEROE = img`
    . . . . . f f f f f f . . . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 d d d d d d 5 f . . .
    . . . f d d f d d f d d f . . .
    . . . f d d d d d d d d f . . .
    . . . . f d d e e d d f . . . .
    . . . f f f 8 8 8 8 f f f . . .
    . . f 8 8 8 8 9 9 8 8 8 8 f . .
    . . f d 8 8 9 9 9 9 8 8 d f . .
    . . f d 8 8 8 9 9 8 8 8 d f . .
    . . f 8 4 4 4 4 4 4 4 4 8 f . .
    . . f 8 8 8 8 f f 8 8 8 8 f . .
    . . . f 8 8 f . . f 8 8 f . . .
    . . . f e e f . . f e e f . . .
    . . . f f f . . . . f f f . . .
    `
// Héroe de espaldas: sin cara; toda la cabeza es pelo, y debajo asoma la nuca.
IMAGEN_HEROE_ARRIBA = img`
    . . . . . f f f f f f . . . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f f f d d d d f f f . . .
    . . f 8 8 8 8 8 8 8 8 8 8 f . .
    . . f d 8 8 8 8 8 8 8 8 d f . .
    . . f d 8 8 8 8 8 8 8 8 d f . .
    . . f 8 4 4 4 4 4 4 4 4 8 f . .
    . . f 8 8 8 8 f f 8 8 8 8 f . .
    . . . f 8 8 f . . f 8 8 f . . .
    . . . f e e f . . f e e f . . .
    . . . f f f . . . . f f f . . .
    `
// Héroe de perfil mirando a la izquierda; para la derecha se le da la vuelta como en un espejo.
IMAGEN_HEROE_IZQUIERDA = img`
    . . . . . f f f f f . . . . . .
    . . . . f 5 5 5 5 5 f . . . . .
    . . . f 5 5 5 5 5 5 5 f . . . .
    . . . f d d 5 5 5 5 5 f . . . .
    . . . f d f d 5 5 5 5 f . . . .
    . . . f d d d 5 5 5 5 f . . . .
    . . . . f d d d 5 5 f . . . . .
    . . . f f f 8 8 8 8 f f . . . .
    . . f 8 8 8 8 8 8 8 8 8 8 f . .
    . . f d 8 8 8 9 9 8 8 8 e f . .
    . . f d 8 8 8 9 8 8 8 8 e f . .
    . . . f 8 4 4 4 4 4 4 8 f . . .
    . . . f 8 8 8 8 8 8 8 8 f . . .
    . . . f 8 8 f f 8 8 f f . . . .
    . . . f e e f . f e e f . . . .
    . . . f f f . . . f f f . . . .
    `
// Hacia abajo, el héroe mira como en la imagen estándar: es la misma imagen, sin un segundo literal en
// la memoria flash.
IMAGEN_HEROE_ABAJO = IMAGEN_HEROE
IMAGEN_HEROE_DERECHA = IMAGEN_HEROE_IZQUIERDA.clone()
IMAGEN_HEROE_DERECHA.flipX()
// Esqueleto: cuencas huecas, caja de costillas y brazos de huesos finos.
IMAGEN_ESQUELETO = img`
    . . . . . f f f f f f . . . . .
    . . . . f 1 1 1 1 1 1 f . . . .
    . . . f 1 1 1 1 1 1 1 1 f . . .
    . . . f 1 f f 1 1 f f 1 f . . .
    . . . f 1 f f 1 1 f f 1 f . . .
    . . . f 1 1 1 f f 1 1 1 f . . .
    . . . . f 1 f f f f 1 f . . . .
    . . . . . f 1 1 1 1 f . . . . .
    . . . f f f 1 1 1 1 f f f . . .
    . . f 1 f 1 f 1 1 f 1 f 1 f . .
    . . f 1 f 1 1 f f 1 1 f 1 f . .
    . . f 1 f 1 f 1 1 f 1 f 1 f . .
    . . f f f . f 1 1 f . f f f . .
    . . . . . f 1 f f 1 f . . . . .
    . . . . . f 1 f f 1 f . . . . .
    . . . . f f f . . f f f . . . .
    `
// Baba: grumo redondo, brillo arriba a la izquierda y sombra fría abajo.
IMAGEN_BABA = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . f f f f f f . . . . .
    . . . f f 7 1 7 7 7 7 f f . . .
    . . f 7 7 1 7 7 7 7 7 7 7 f . .
    . f 7 7 7 7 f f 7 7 f f 7 7 f .
    . f 7 7 7 7 f 1 7 7 f 1 7 7 f .
    . f 7 7 7 7 f f 7 7 f f 7 7 f .
    . f 7 7 7 7 7 7 7 7 7 7 7 7 f .
    . f 7 7 7 f f f f f f 7 7 7 f .
    . f 7 7 7 7 7 7 7 7 7 7 7 7 f .
    . f 7 7 6 6 7 7 7 7 6 6 7 7 f .
    . f 6 6 6 6 6 6 6 6 6 6 6 6 f .
    . f f f f f f f f f f f f f f .
    . . . . . . . . . . . . . . . .
    `
// Corazón: punto de brillo claro arriba a la izquierda, para que destaque sobre el suelo oscuro.
IMAGEN_CORAZON = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . f f f . . . . f f f . . .
    . . f 3 3 2 f f f f 2 2 2 f . .
    . f 2 1 1 2 2 2 2 2 2 2 2 2 f .
    . f 2 1 2 2 2 2 2 2 2 2 2 2 f .
    . f 2 2 2 2 2 2 2 2 2 2 2 2 f .
    . . f 2 2 2 2 2 2 2 2 2 2 f . .
    . . . f 2 2 2 2 2 2 2 2 f . . .
    . . . . f 2 2 2 2 2 2 f . . . .
    . . . . . f 2 2 2 2 f . . . . .
    . . . . . . f 2 2 f . . . . . .
    . . . . . . . f f . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// Llave: paletón grueso, anilla redonda con agujero y un punto de brillo.
IMAGEN_LLAVE = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . f f f f . . . . . . . .
    . . . f 1 5 5 5 f . . . . . . .
    . . f 5 5 f f 5 5 f . . . . . .
    . . f 5 f f f f 5 f f f f f . .
    . . f 5 5 f f 5 5 5 5 5 5 5 f .
    . . . f 5 5 5 5 f f 5 f 5 5 f .
    . . . . f f f f . . f f f f f .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// Moneda: borde dorado, anillo grabado y brillo arriba a la izquierda.
IMAGEN_MONEDA = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . f f f f f f . . . . .
    . . . . f 5 1 5 5 5 5 f . . . .
    . . . f 5 1 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 4 4 4 5 5 f . . .
    . . . f 5 5 4 5 5 5 4 5 f . . .
    . . . f 5 5 4 5 5 5 4 5 f . . .
    . . . f 5 5 5 4 4 4 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . . . f f f f f f . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// Bola de fuego del héroe: núcleo blanco, amarillo, naranja y borde rojo.
IMAGEN_BOLA_DE_FUEGO = img`
    . . 2 4 4 2 . .
    . 2 4 5 5 4 2 .
    2 4 5 5 5 5 4 2
    2 4 5 1 1 5 4 2
    2 4 5 1 1 5 4 2
    2 4 5 5 5 5 4 2
    . 2 4 5 5 4 2 .
    . . 2 4 4 2 . .
    `
// --- mosaicos derivados: variedad en el suelo y en la pared ---
// Variante 2: grietas que cruzan dos losas.
let MOSAICO_SUELO_2 = MOSAICO_SUELO.clone()
MOSAICO_SUELO_2.drawLine(1, 3, 6, 5, 15)
MOSAICO_SUELO_2.drawLine(6, 5, 5, 6, 15)
MOSAICO_SUELO_2.drawLine(9, 10, 13, 13, 15)
MOSAICO_SUELO_2.setPixel(11, 9, 11)
MOSAICO_SUELO_2.setPixel(2, 10, 15)
// Variante 3: grava en la losa de abajo a la derecha y una grieta fina a la izquierda.
let MOSAICO_SUELO_3 = MOSAICO_SUELO.clone()
MOSAICO_SUELO_3.setPixel(9, 10, 11)
MOSAICO_SUELO_3.setPixel(11, 9, 11)
MOSAICO_SUELO_3.setPixel(12, 12, 11)
MOSAICO_SUELO_3.setPixel(10, 13, 11)
MOSAICO_SUELO_3.setPixel(13, 11, 15)
MOSAICO_SUELO_3.drawLine(2, 11, 5, 11, 15)
MOSAICO_SUELO_3.setPixel(4, 2, 11)
// Base del muro: aquí el muro se encuentra con el suelo. Un zócalo claro y debajo una junta negra de sombra: así se ve
// enseguida dónde acaba la pared.
let MOSAICO_PARED_BASE = MOSAICO_PARED.clone()
MOSAICO_PARED_BASE.fillRect(0, 12, 16, 2, 11)
MOSAICO_PARED_BASE.fillRect(0, 14, 16, 1, 12)
MOSAICO_PARED_BASE.fillRect(0, 15, 16, 1, 15)
MOSAICO_PARED_BASE.fillRect(4, 12, 1, 2, 15)
MOSAICO_PARED_BASE.fillRect(11, 12, 1, 2, 15)
MOSAICO_PARED_BASE.setPixel(1, 13, 7)
MOSAICO_PARED_BASE.setPixel(2, 13, 7)
MOSAICO_PARED_BASE.setPixel(13, 13, 7)
// Roca: la montaña maciza detrás de los muros, casi negra y con poca textura.
let MOSAICO_ROCA = image.create(16, 16)
MOSAICO_ROCA.fill(15)
MOSAICO_ROCA.drawLine(2, 2, 5, 3, 12)
MOSAICO_ROCA.drawLine(9, 6, 12, 5, 12)
MOSAICO_ROCA.drawLine(4, 11, 7, 12, 12)
MOSAICO_ROCA.setPixel(1, 8, 12)
MOSAICO_ROCA.setPixel(6, 8, 12)
MOSAICO_ROCA.setPixel(13, 9, 12)
MOSAICO_ROCA.setPixel(11, 14, 12)
// Trampa de pinchos: un pozo oscuro en el suelo con tres pinchos de filo claro.
MOSAICO_PINCHOS = MOSAICO_SUELO.clone()
MOSAICO_PINCHOS.fillRect(1, 1, 14, 14, 15)
MOSAICO_PINCHOS.drawLine(1, 1, 14, 1, 12)
MOSAICO_PINCHOS.fillRect(3, 5, 1, 3, 11)
MOSAICO_PINCHOS.fillRect(2, 8, 3, 2, 11)
MOSAICO_PINCHOS.fillRect(1, 10, 5, 3, 11)
MOSAICO_PINCHOS.fillRect(8, 3, 1, 3, 11)
MOSAICO_PINCHOS.fillRect(7, 6, 3, 3, 11)
MOSAICO_PINCHOS.fillRect(6, 9, 5, 4, 11)
MOSAICO_PINCHOS.fillRect(12, 5, 1, 3, 11)
MOSAICO_PINCHOS.fillRect(11, 8, 3, 2, 11)
MOSAICO_PINCHOS.fillRect(10, 10, 5, 3, 11)
MOSAICO_PINCHOS.setPixel(3, 5, 1)
MOSAICO_PINCHOS.setPixel(2, 8, 1)
MOSAICO_PINCHOS.setPixel(1, 10, 1)
MOSAICO_PINCHOS.setPixel(8, 3, 1)
MOSAICO_PINCHOS.setPixel(7, 6, 1)
MOSAICO_PINCHOS.setPixel(6, 9, 1)
MOSAICO_PINCHOS.setPixel(12, 5, 1)
MOSAICO_PINCHOS.setPixel(11, 8, 1)
MOSAICO_PINCHOS.setPixel(10, 10, 1)
// --- más enemigos y objetos ---
// Murciélago: alas anchas, orejas puntiagudas y ojos rojos.
IMAGEN_MURCIELAGO = img`
    . . . . . f f . . f f . . . . .
    f f . . f a a f f a a f . . f f
    f a f f a a a a a a a a f f a f
    f a a a a a 2 a a 2 a a a a a f
    f a a a a a a f f a a a a a a f
    . f a a a a a a a a a a a a f .
    . . f f a a a a a a a a f f . .
    . . . . f f a a a a f f . . . .
    `
// Mago: capucha puntiaguda, ojos brillantes en la sombra y una bola mágica entre las manos. La punta hace que la
// silueta se reconozca al instante.
IMAGEN_MAGO = img`
    . . . . . . . f f . . . . . . .
    . . . . . . f a a f . . . . . .
    . . . . . f a a a a f . . . . .
    . . . . f a a a a a a f . . . .
    . . . f a a f f f f a a f . . .
    . . . f a f 9 f f 9 f a f . . .
    . . . f a f f f f f f a f . . .
    . . . . f a a a a a a f . . . .
    . . . f f a a a a a a f f . . .
    . . f a a a a a a a a a a f . .
    . . f a a a f 3 3 f a a a f . .
    . . f a a f 3 1 1 3 f a a f . .
    . . f a a a f 3 3 f a a a f . .
    . . f a a a a a a a a a a f . .
    . . f a a a a a a a a a a f . .
    . . . f f f f f f f f f f . . .
    `
// Guardián: coraza pesada, yelmo con rendija para los ojos y un gran escudo redondo en el lado izquierdo: la silueta
// más ancha de todos los enemigos.
IMAGEN_GUARDIAN_IZQUIERDA = img`
    . . . . . . . f f f f f . . . .
    . . . . . . f b b b b b f . . .
    . . . . . . f f f b f f f . . .
    . . . . . . f b b b b b f . . .
    . . . . . . f f c c f f f . . .
    . . f f f f f b b b b b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . f b 6 9 6 f b c c c b b f . .
    . f b 6 9 6 f b c c c b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . . f b 6 6 f b b b b b f . . .
    . . . f b b f b b b b f . . . .
    . . . . f f f b b b b f . . . .
    . . . . . . f e e f e e f . . .
    . . . . . . f f f . f f f . . .
    `
// Para la derecha se le da la vuelta como en un espejo (igual que al héroe). Arriba y abajo necesitan imágenes propias:
// el escudo redondo pasa al borde de arriba o al de abajo. Las cuatro imágenes se crean al arrancar; durante el juego
// solo se cambia con setImage, sin crear imágenes nuevas.
IMAGEN_GUARDIAN_DERECHA = IMAGEN_GUARDIAN_IZQUIERDA.clone()
IMAGEN_GUARDIAN_DERECHA.flipX()
// Mirando hacia abajo: yelmo con rendija visto de frente y el escudo colgado delante de las piernas.
IMAGEN_GUARDIAN_ABAJO = img`
    . . . . . f f f f f f . . . . .
    . . . . f b b b b b b f . . . .
    . . . . f f b f f b f f . . . .
    . . . . f b b b b b b f . . . .
    . . . . f f c c c c f f . . . .
    . . . f b b b b b b b b f . . .
    . . . f b b b b b b b b f . . .
    . . . f b b c c c c b b f . . .
    . . . f b b b b b b b b f . . .
    . . f f f f f f f f f f f f . .
    . f 6 6 6 6 6 6 6 6 6 6 6 6 f .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . f 6 6 6 6 9 9 9 9 6 6 6 6 f .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . . f 6 6 6 6 6 6 6 6 6 6 f . .
    . . . f f f f f f f f f f . . .
    `
// Mirando hacia arriba: se ve la espalda y el escudo sobresale como un arco ancho por encima del yelmo.
IMAGEN_GUARDIAN_ARRIBA = img`
    . . . f f f f f f f f f f . . .
    . . f 6 6 6 6 6 6 6 6 6 6 f . .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . f 6 6 6 6 9 9 9 9 6 6 6 6 f .
    . . f f f f f f f f f f f f . .
    . . . . . f b b b b b f . . . .
    . . . . . f b b b b b f . . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b c c b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . . f b b b b b f . . . .
    . . . . . f b b b b b f . . . .
    . . . . . f e e f e e f . . . .
    . . . . . f f f . f f f . . . .
    `
// Jefe: cuernos, ojos amarillos como brasas y colmillos. Se dibuja al doble de tamaño con setScale(2), por eso las
// formas son toscas y sin detalles finos.
IMAGEN_JEFE = img`
    . f f . . . . . . . . . . f f .
    . f 4 f . f f f f f f . f 4 f .
    . f 4 f f 2 2 2 2 2 2 f f 4 f .
    . . f 4 2 2 2 2 2 2 2 2 4 f . .
    . . f 2 5 5 2 2 2 2 5 5 2 f . .
    . . f 2 5 f 2 2 2 2 f 5 2 f . .
    . . f 2 2 2 2 2 2 2 2 2 2 f . .
    . . f 2 f 1 1 1 1 1 1 f 2 f . .
    . . . f 2 f 1 f f 1 f 2 f . . .
    . . f f 2 2 2 2 2 2 2 2 f f . .
    . f 4 f 2 2 e e e e 2 2 f 4 f .
    . f 4 f 2 2 2 e e 2 2 2 f 4 f .
    . . f f 2 2 2 2 2 2 2 2 f f . .
    . . . f 2 2 f f f f 2 2 f . . .
    . . . f 2 2 f . . f 2 2 f . . .
    . . f f f f . . . . f f f f . .
    `
// Cofre: duelas de madera con juntas oscuras, bandas de metal y cerradura dorada.
IMAGEN_COFRE = img`
    . . f f f f f f f f f f f f . .
    . f 4 4 4 4 4 4 4 4 4 4 4 4 f .
    . f e e e f e e e e f e e e f .
    . f e e e f e e e e f e e e f .
    . f b b b b f f f f b b b b f .
    . f e e e f 5 5 5 5 f e e e f .
    . f e e e f 5 f f 5 f e e e f .
    . f e e e f 5 5 5 5 f e e e f .
    . f e e e f e e e e f e e e f .
    . f 4 4 4 4 4 4 4 4 4 4 4 4 f .
    . f b b b b b b b b b b b b f .
    . . f f f f f f f f f f f f . .
    `
// Antorcha: punta de llama blanca y mango envuelto.
IMAGEN_ANTORCHA = img`
    . . . 5 . . . .
    . . 4 5 4 . . .
    . 4 5 1 5 4 . .
    . 4 5 1 1 5 4 .
    . 4 5 5 5 5 4 .
    . . 4 5 5 4 . .
    . . 2 4 4 2 . .
    . . f e e f . .
    . . f b b f . .
    . . f e e f . .
    . . f b b f . .
    . . f e e f . .
    `
// Bola mágica de los enemigos: borde violeta y centro rosa, claramente distinta de la bola de fuego amarilla del héroe.
IMAGEN_BOLA_MAGICA = img`
    . . a a a a . .
    . a 3 3 3 3 a .
    a 3 3 1 3 3 3 a
    a 3 1 1 3 3 3 a
    a 3 3 3 3 3 3 a
    a 3 3 3 3 3 3 a
    . a 3 3 3 3 a .
    . . a a a a . .
    `
// Barril: borde claro de la tapa, duelas de madera y dos aros de metal.
DECORADO_BARRIL = img`
    . . f f f f f f f f . .
    . f d d d d d d d d f .
    . f e e f e e f e e f .
    . f b b b b b b b b f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f b b b b b b b b f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . . f f f f f f f f . .
    `
// Huesos: blancos y con luz arriba, beige y en sombra abajo.
DECORADO_HUESOS = img`
    . f f . . . . . . f f .
    f 1 1 f . . . . f 1 1 f
    f 1 1 1 f f f f 1 1 1 f
    f 1 1 1 1 1 1 1 1 1 1 f
    f d d d d d d d d d d f
    f d d d f f f f d d d f
    f d d f . . . . f d d f
    . f f . . . . . . f f .
    `

// El Calliope Hacker: una persona con sudadera negra y la capucha puesta, de espaldas, en su escritorio con monitor,
// Calliope mini y GameKit; además, un gato dormido, una mochila turquesa y zapatillas turquesas. La imagen mide 64
// píxeles de ancho y 40 de alto. Los colores del estudio se pasaron a la paleta estándar de este juego, sin cambiarla:
// negro f, turquesa 6, luz del borde 9, madera e y pared c. Sobre negro, la sudadera sería invisible; por eso siempre
// está delante de una placa del color c (intro.dibujarHackerEnPlaca).
let IMAGEN_HACKER = img`
    . . . . . . . . . . . . . . . . f f f f f . . . . . . . . . . . . . . . c . . . . . . . . . . . . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . f f f f f f f 9 . . . . . c . c . b b b b b b b b b b b b b b b b b b b b b b . . . . . . . . . . .
    . . . . . . . . . . . . . f b b f f f f f f 9 . c . c . c . c f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f b f f f f f f f f f 9 . c . c c c c f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f b f f f f f f f f f 9 c c c c c c c f f f 9 9 9 9 9 9 f f f f f f f f f f f f f . c . . . . . . . . .
    . . . . . . . . . . . f b f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c . c . . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f 5 5 5 5 5 5 5 5 5 f f f f f f f f . c . c . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c c c . c . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f 6 6 6 6 6 f f f f f f f f f f f f c c c c . c . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c c 5 5 c . c 5 5 . .
    . . . . . . . . . . . b f f f f f f f f f f f f 9 c c c c c c f f f f f f f 2 2 2 2 2 2 2 2 f f f f f f f c c 5 8 8 8 8 8 5 . .
    . . . . . . . . . . f f b f f f f f f f f f f f f 9 c c c c c f f f f f f f f f f f f f f f f f f f f f f c 8 8 8 8 8 8 8 8 8 .
    . . . . . . . . . f f f f b b f f f f f f f f f f f 9 c c c c f f f f f 9 9 9 9 9 9 9 9 9 9 9 f f f f f f 5 8 8 8 2 8 2 8 8 8 5
    . . . . . . f f f f f f f f f b b b b f f f f f f f f 9 c c c f f f f f f f f f f f f f f f f f f f f f f 5 8 8 8 2 2 2 8 8 8 5
    . . . . . f 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 c c f f f 8 8 8 8 f f f f f f f f f f f f f f f c 8 8 8 8 2 8 8 8 8 .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 c f f f f f f f f f f f f f f f f f f f f f f c c 5 8 8 8 8 8 5 . c
    . . . . f 6 6 6 6 6 6 6 8 f f f f f f f f f f f f b f f f f 9 f f f f f f f f f f f f f f f f f f f f f f c c 5 5 c f c 5 5 c .
    . . . . f 6 6 6 6 6 6 6 8 f f f f f f f f f f f f f b f f f f 9 c c c c c c c c c b b b c c c c c c c c c c c c c c c c . c . .
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f b f f f f f d d c c c b b b b b b b b b c c c c c c c c c c c c . c . c .
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f b f f f f d d f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f f 8 b 9 b 6 b 2 b f e e e e e e e e e e f f f f f f f f f f f f e e e e
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f f 1 f f d b d f 2 f 2 f f e e e
    . . . . f 8 8 6 6 6 6 8 8 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 1 1 f f f f f 2 f 2 f f e e e
    . . . . f 8 8 6 6 6 6 8 8 f f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 f f f f f f f f f f e e e e
    . . . . . f 8 8 6 6 8 8 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . . f 8 8 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f b f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . . . f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f f f f f f f f f c c c c c c c c c c c b b c c . c . c . c . . b d d d d d d
    . . . . . . . f f f f f f f f f f f f f f f f f f f f f f f f f f f c c c c c c c c c c c b b c . c . c . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f . f f f f f . c f f f f f b . c . c . c . c . c . c b b . c . . . . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f . f f f f f . . c f f f f b c . c . c . c . c . c . b b . . 8 6 6 6 8 . . . b d b b b b d
    . . . . . . . . . . . . . . . . . f f . f f f f f . . . f f f f b . . . c . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f 6 6 6 6 6 6 6 . . f f f f b . . . . . . . . . . . . b b . 8 6 f f f 6 8 . . b d d d d d d
    . . f . . . f . . . . . . . . . . f f 6 1 6 6 6 6 6 . . f f f f b . . . . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    . . f f . f f . . . . . . . . . . f f 1 1 1 1 1 1 1 . . f f f f b . . . . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d b b b b d
    . f 1 1 1 1 1 f 1 1 . . . . . . . f f . . . . . . . . 6 6 6 6 6 6 6 6 . . . . . . . . . . b b . 8 6 b b b 6 8 . . b d d d d d d
    . 1 1 f 1 1 1 1 1 1 1 f f f f f f f f f f f f f f . 6 6 1 6 6 6 6 6 6 6 . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    f 1 1 1 1 1 1 f f 1 1 . . . . f f . . . . . . f f . 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    8 6 6 6 6 6 6 6 6 6 8 . . . . b b . . . . . . b b . . . . . . . . . . . . . . . . . . . . b b . . 8 8 8 8 8 . . . b d b b b b d
    . 8 8 8 8 8 8 8 8 8 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b d d d d d d
    `
// El cuadro de la pared de la sala de salida del piso 1: el mismo Hacker, pequeño, en un marco dorado. Solo decorado,
// sin colisión (objetos.ts).
let IMAGEN_HACKER_PARED = img`
    5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
    4 c c c c c c c c c c c c c c c c c c 4
    4 c c c f f f c c c c f f f f f f f c 4
    4 c c f b f f 9 c c c f 5 5 5 f f f c 4
    4 c c f b f f f 9 c c f f f f f f f c 4
    4 c c f f f f f 9 c c f 9 9 9 9 f f c 4
    4 c 6 f f f f f f 9 c f f f f f f f c 4
    4 c 6 f f f f f f f 9 f f 2 2 f f f c 4
    4 c 6 f f f f f f f f 9 f f f f f f c 4
    4 c 6 f f f f f f f f d e e e e e e e 4
    4 c 6 6 6 6 f f f f c c e c c c c e c 4
    4 c c c c c f f c f f c e c c c c e c 4
    4 c c c c 6 6 c c 6 6 c e c c c c e c 4
    4 c c c c 1 1 c c 1 1 c c c c c c c c 4
    4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
    `
// El Hacker como espectador en el borde del salón del trono, en el epílogo (epilogo.ts), de espaldas como en la tarjeta
// del estudio; la imagen 2 celebra con los brazos en alto.
let IMAGEN_ESPECTADOR = img`
    . . . . . . . . . . . .
    . . . . . . . . . . . .
    . . . . . . . . . . . .
    . . . . f f f 9 . . . .
    . . . f f f f f 9 . . .
    . . b b f f f f f 9 . .
    . . b f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f 9 . . .
    . . f f f f f f f f . .
    . b f f f f f f f f 9 .
    . b f f f f f f f f 9 .
    . b . f f f f f f . 9 .
    . . . f f . . f f . . .
    . . 6 6 6 . . 6 6 6 . .
    . . 1 1 1 . . 1 1 1 . .
    `
let IMAGEN_ESPECTADOR_ALEGRE = img`
    . b . . . . . . . . 9 .
    . b . . . . . . . . 9 .
    . b . . . . . . . . 9 .
    . b f . f f f 9 . 9 9 .
    . . b f f f f f 9 9 . .
    . . b b f f f f f 9 . .
    . . b f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f 9 . . .
    . . f f f f f f f f . .
    . . f f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f f . . .
    . . . f f . . f f . . .
    . . 6 6 6 . . 6 6 6 . .
    . . 1 1 1 . . 1 1 1 . .
    `
// Desvanecer: un enemigo vencido desaparece entre estrellas claras (amarillas y blancas, nunca de sus propios colores y
// nunca rojas). Tres imágenes de unos 150 ms cada una, que se cambian en avanzarNubecitas() (eventos.ts).
let IMAGEN_NUBECITA_1 = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . 5 1 5 . . . . . . .
    . . . . 5 5 1 1 1 5 5 . . . . .
    . . . . . . 5 1 5 . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
let IMAGEN_NUBECITA_2 = img`
    . . . . . . . 1 . . . . . . . .
    . . . 5 . . 5 1 5 . . 5 . . . .
    . . 5 1 5 . . 5 . . 5 1 5 . . .
    . . . 5 . . . . . . . 5 . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . 5 . . . . 5 1 5 . . . . 5 . .
    5 1 5 . . . . 5 . . . . 5 1 5 .
    . 5 . . . . . . . . . . . 5 . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . 5 . . . . . . . 5 . . . .
    . . 5 1 5 . . 5 . . 5 1 5 . . .
    . . . 5 . . 5 1 5 . . 5 . . . .
    . . . . . . . 1 . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
let IMAGEN_NUBECITA_3 = img`
    . . . . . . . . . . . . . . . .
    . 1 . . . . . . . . . . . . 5 .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . 5 . . . . . . . . . . . . .
    . . . . . . . . . . . . . 1 . .
    . . . . . . . . . . . . . . . .
    1 . . . . . . . . . . . . . . 5
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . 1 . . . . . . . . . 5 . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . 5 . . . . . . 1 . . . . . . .
    . . . . . . . . . . . . . 1 . .
    . . . . . . . . . . . . . . . .
    `
