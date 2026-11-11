# Cueva real

¡Hola! Esto es **Cueva real**, un juego de **Calliope Hacker** para el **Calliope mini 3 con GameKit**.

Un ladrón se ha llevado la corona del castillo y se esconde con ella en lo más hondo de la mazmorra. Tú bajas como
héroe, piso a piso. Cada piso se construye de nuevo, al azar, en cada partida. En la oscuridad solo ves un pequeño
círculo a tu alrededor. Encuentra la llave, busca la escalera y haz desaparecer a los enemigos con tu bola de fuego.
Cada 5 pisos te espera un jefe, y en el piso 15, el ladrón de la corona. ¡Véncelo y recupera la corona! Por cierto: en
el piso 1 hay un cuadrito del Calliope Hacker colgado de la pared.

## Cómo se juega

- **Cruceta:** andar y apuntar (el héroe mira hacia donde camina)
- **A:** bola de fuego (mantenla pulsada para seguir disparando)
- **Mantener B:** mirar el mapa del piso
- **Menú:** pausa; ahí también puedes quitar o poner el sonido
- **Recoger cofres y antorchas:** disparo triple, fuego rápido, botas veloces, un corazón extra o más luz

## Ahora te toca construir a ti

Todo el código fuente está en este archivo de juego. Ábrelo en MakeCode Arcade (arcade.makecode.com, «Importar»). Todos
los números con los que puedes jugar están en `ajustes.ts`. Cambia un número, arranca el simulador y mira qué pasa:

- **Más vidas:** ahí encuentras `VIDAS_INICIALES = 6`. Con `20` empiezas con muchos más corazones.
- **Un círculo de luz más grande:** ahí encuentras `LUZ_NORMAL = 46`. Con `90` ves mucho más lejos en la
  oscuridad.
- **Disparar más deprisa:** ahí encuentras `RECARGA_NORMAL_MS = 420`, el tiempo de espera entre dos
  disparos, en milisegundos. Con `100` disparas casi sin pausa.

Una explicación del código fuente para niños, padres y docentes está en calliope-hacker.de.
