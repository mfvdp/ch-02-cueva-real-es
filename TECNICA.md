# Parte técnica: Cueva real

Este archivo explica en pocas palabras cómo está organizado el código fuente y cómo se construye. La bienvenida y las
primeras ideas para cambiar el juego están en `README.md`.

## Organización

Es un proyecto para MakeCode Arcade escrito en TypeScript. `pxt.json` da el nombre del proyecto `cueva-real` y lista
todos los archivos en el orden en que MakeCode los lee y los ejecuta. `mkc.json` dice para qué aparato se construye: el
Calliope mini 3 con GameKit (variante «n3»). Los archivos `tilemap.g.ts` y `tilemap.g.jres` los fabrica el editor; están
ahí y no se cambian a mano.

Los archivos del juego:

- `textos.ts`: Todos los textos del juego: cada valor de la enumeración IdTexto tiene exactamente un texto en la lista
  textos.
- `menus.ts`: Menú de pausa y pantalla final del juego, con los textos de textos.ts.
- `ajustes.ts`: Ajustes: ¡cambia el juego aquí!
- `graficos.ts`: Gráficos: todos los mosaicos, sprites e imágenes derivadas.
- `tipos.ts`: Tipos de sprite (SpriteKind) para objetos, decorado y marcador.
- `enemigos.ts`: Enemigos: la clase de datos, cómo se crean, cómo se buscan, sus disparos y el cerebro del jefe.
- `estado.ts`: Estado global del juego.
- `ayudas.ts`: Pequeñas funciones de ayuda, sin estado propio.
- `sonido.ts`: Sonido: todos los tonos y la música en un solo lugar.
- `cine.ts`: Cine: la caja de herramientas para la intro y el epílogo.
- `intro.ts`: Intro: la historia y la tarjeta del estudio antes de la imagen del título.
- `tutorial.ts`: Carteles de tutorial: el tutorial de la intro.
- `epilogo.ts`: Epílogo: la victoria.
- `luz.ts`: Oscuridad y luz: el círculo de visión alrededor del héroe.
- `mazmorra.ts`: Crear la mazmorra: cuadrícula, salas, pasillos, trampas y mapa de mosaicos.
- `objetos.ts`: Objetos y decorado: se colocan y se recogen al cambiar de piso.
- `heroe.ts`: El héroe: disparar bolas de fuego, elegir la imagen según hacia dónde mira y recibir golpes.
- `pantalla-titulo.ts`: Pantalla del título: el muro de piedra, las antorchas, la imagen del título y la pantalla del
  título.
- `piso.ts`: Construir un piso entero.
- `eventos.ts`: Todos los manejadores de eventos.
- `marcador.ts`: Marcador: el número del piso y el mapa general (botón B).
- `main.ts`: Un juego de mazmorras al azar para MakeCode Arcade.
- `tilemap.g.ts`: Código generado automáticamente.

## Cómo se desarrolla el juego

1. `catalogo.inicializar`, en `textos.ts`, mira si este arranque es un nuevo comienzo después del fin de la partida e
   instala los menús.
2. `mostrarPantallaTitulo`, en `pantalla-titulo.ts`, reproduce la intro: la historia, la tarjeta «Calliope Hacker
   presenta», la tarjeta del título y los carteles del tutorial. Cada parte se puede saltar con A. Después enseña la
   imagen del título y espera a que se pulse A.
3. `main.ts` crea al héroe, la imagen de la oscuridad y el marcador, y después llama a `construirPiso`.
4. `construirPiso`, en `piso.ts`, construye un piso: `crearSalas` y `cavarPasillo` (en `mazmorra.ts`) excavan salas y
   pasillos en la cuadrícula, en una sala se marca la escalera, `colocarTrampas` marca las trampas y `construirMosaicos`
   convierte la cuadrícula en un mapa de mosaicos. Después vienen el decorado, la llave (o el jefe), los enemigos y los
   objetos.
5. En cada fotograma se ejecuta la función de `game.onUpdate`, en `main.ts`: la dirección de la mirada del héroe, el
   disparo con A, las nubecitas de estrellas y la oscuridad. Cada 280 milisegundos, `game.onUpdateInterval`, también en
   `main.ts`, mueve a los enemigos.
6. Los contactos (una bola de fuego toca a un enemigo, el héroe recoge algo, el héroe pisa la escalera) los atienden los
   manejadores de `eventos.ts`.
7. Cuando cae el ladrón de la corona, `epilogo.reproducir`, en `epilogo.ts`, reproduce el final.

La cuadrícula de un piso mide 26 mosaicos de ancho y 22 de alto. Cada mosaico es un número de `cuadricula`: 0 es una
pared, 2 la escalera, 3 una trampa y todo lo demás es suelo. La dificultad del juego se ajusta en `ajustes.ts`.

## Sonido, gráficos y guardado

- **Gráficos:** las imágenes están en `graficos.ts`. Los nombres con `IMAGEN_` son sprites y los que llevan `MOSAICO_`,
  mosaicos. Todo lo demás se pinta durante el juego con rectángulos, círculos y líneas, y así el archivo del juego se
  mantiene pequeño.
- **Sonido:** `sonido.ts` reúne todos los sonidos y toda la música. Un sonido es un texto corto de notas (`new
  music.Melody("…")`).
- **Guardado:** la mejor puntuación (`info.saveHighScore`) y el volumen se quedan guardados en el aparato. Si le pones
  otro programa, MakeCode borra lo guardado en el siguiente arranque.

## Construir el juego

- **En el navegador:** abre arcade.makecode.com, elige «Importar» y abre el archivo de juego `cueva-real.hex`. Todo el
  código fuente está dentro del archivo de juego. El simulador enseña el juego enseguida.
- **En tu ordenador:** con la herramienta de línea de comandos de MakeCode (el paquete npm `makecode`), ejecuta
  `makecode build` en esta carpeta. El archivo de juego para el aparato queda luego en `built/n3/binary.hex`.

## En el aparato

Conecta el Calliope mini 3 a tu ordenador con el cable USB. Aparece como una unidad de disco. Arrastra el archivo de
juego (`.hex`) a esa unidad y el juego arranca solo. La pantalla del GameKit mide 160 × 120 píxeles y tiene 16 colores.

Este juego también existe en alemán, inglés y francés. Las cuatro versiones se construyen a partir del mismo proyecto
fuente.
