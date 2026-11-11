// Sonido: todos los tonos y la música en un solo lugar. El resto del juego solo llama a estas funciones y no sabe cómo
// se construye cada ruido.
//
// ¿POR QUÉ NO music.playTone()?
// music.playTone(hz, ms) detiene a quien lo llama durante ms milisegundos (mira playTone en
// pxt-common-packages/mixer/melody.ts: con ms <= 2000 sigue un pause(ms)). Pero nuestros ruidos suenan dentro de
// manejadores de solape, en mitad del paso de la física: el juego se pararía un momento con cada moneda recogida.
//
// En su lugar usamos music.Melody:
//   new music.Melody(texto)       un sonido a partir de un patrón de texto corto
//   melodia.play(volumen)         suena UNA vez en segundo plano
//   melodia.loop(volumen)         suena en bucle continuo en segundo plano
//   melodia.stop()                lo corta
// play() y loop() llaman por dentro a playCore(), que inicia la reproducción con control.runInParallel() en un hilo
// propio. Quien llama sigue enseguida, y eso es justo lo que necesitamos. (Fuente: mixer/melody.ts, clase Melody,
// líneas de playCore, play y loop.)
//
// EL PATRÓN DE TEXTO (el analizador está en mixer/melody.ts, clase MelodyPlayer.play, donde el lenguaje
// también está comentado):
//   ~n            forma de onda: 1 triángulo, 2 diente de sierra, 3 seno, 4 ruido afinable,
//                 5 ruido blanco, 11..15 cuadrada, 16..18 cuadrada filtrada
//   @a,d,s,r      curva de la envolvente: subida en ms, bajada en ms, volumen de sostén 0..255, extinción en ms
//   !hz,ms        un tono con frecuencia y duración fijas
//   ^hz           frecuencia final: el tono se desliza hacia ella
//   C4:2          nota Do, octava 4, duración 2 (4 = un tiempo)
//   R:2           silencio
//   -180          ritmo en pulsos por minuto
// Una palabra sin nota y sin «!» no suena nada: solo cambia la forma de onda, la envolvente o el ritmo. Por eso se
// puede componer un sonido con varias partes.
//
// CUIDADO al deslizar: con «^» la extinción r tiene que ser 0; si no, el analizador sigue calculando la rampa de
// frecuencia más allá del final del tono y llega a valores negativos (un pitido feo).
namespace sonido {
    // Volúmenes. Al final el analizador calcula (valor * music.volume()) >> 8, así que son escalones relativos.
    // grandes momentos
    const VOLUMEN_PLENO = 255
    // recompensas normales
    const VOLUMEN_MEDIO = 200
    // sonidos muy frecuentes
    const VOLUMEN_SUAVE = 150
    // música del título
    const VOLUMEN_TITULO = 165
    // bucle de la mazmorra, suena todo el rato
    const VOLUMEN_MUSICA = 120
    // segunda voz: solo sostiene, no se impone
    const VOLUMEN_GRAVES = 115
    // acentos lejanos sobre el bucle de la intro
    const VOLUMEN_LEJANO = 95

    // Los sonidos. Cada uno es su propio objeto Melody, para que una nueva llamada solo se corte a sí misma y no a
    // los demás sonidos.

    // --- Combate ---
    // Bola de fuego: un «pew» corto y claro que cae deprisa.
    const SONIDO_DISPARO = new music.Melody("~15 @1,8,120,0 !1150,50^380")
    // Enemigo golpeado, pero que sigue ahí: un golpe corto y áspero.
    const SONIDO_GOLPE = new music.Melody("~4 @0,6,180,0 !520,45^200")
    // Rebotó: primero un clac metálico y luego un zumbido que sube, que suena a rebote.
    const SONIDO_ESCUDO = new music.Melody("~4 @0,0,255,0 !170,22 ~15 @0,3,110,0 !560,34^1600")
    // Enemigo que se desvanece: una nube de ruido que baja y después dos tonos claros.
    const SONIDO_ENEMIGO_DESVANECIDO = new music.Melody("~4 @0,0,255,0 !640,50^90 ~15 @1,8,110,0 !784,40 !1046,55")
    // El jefe se desvanece: un estallido largo de ruido, una caída grave y después una figura de victoria. Adrede mucho
    // más grueso y largo (~1,8 s).
    const SONIDO_JEFE_DESVANECIDO = new music.Melody(
        "~5 @8,700,0,1 !400,1 ~2 @4,2,200,0 !260,320^60 ~15 @2,18,150,0 -230 C5:2 E5:2 G5:2 C6:6")
    // Héroe golpeado: un quejido grave que resbala más un retumbo.
    const SONIDO_HEROE_GOLPEADO = new music.Melody("~2 @0,0,255,0 !220,120^90 ~4 @0,2,170,0 !75,90")

    // --- Objetos --- (todos suben, pero se distinguen bien)
    // Llave: carillón de cuatro escalones, onda cuadrada filtrada.
    const SONIDO_LLAVE = new music.Melody("~16 @1,14,120,70 -380 C5:2 G5:2 C6:2 E6:4")
    // Corazón: un seno cálido, más grave y más suave que todo lo demás.
    const SONIDO_CORAZON = new music.Melody("~3 @12,2,210,90 -300 G4:2 C5:2 E5:4")
    // Moneda: solo dos tonos cuadrados muy cortos y agudos.
    const SONIDO_MONEDA = new music.Melody("~15 @1,4,95,45 -560 B5:2 E6:4")
    // Antorcha: un ruido que crece (el encendido) y después un triángulo cálido que se desliza hacia
    // arriba (la llamarada).
    const SONIDO_ANTORCHA = new music.Melody("~5 @70,2,120,90 !1,150 ~1 @14,2,190,0 !430,150^760")
    // Cofre: un golpe de tapa de madera y después un pequeño acorde.
    const SONIDO_COFRE = new music.Melody("~4 @0,0,255,0 !150,55^80 ~15 @1,10,110,80 -400 C5:2 E5:2 G5:2 C6:5")

    // --- Intro ---
    // Sonido del estudio: el foco de luz recorre las letras.
    const SONIDO_JINGLE_ESTUDIO = new music.Melody("~16 @3,26,120,140 -260 C4:2 G4:2 C5:2 E5:6")
    // La llegada del meteoro: ruido afinable que crece desde lejos y sube de tono. Unos 0,74 s.
    const SONIDO_ACERCAMIENTO = new music.Melody("~4 @80,2,150,0 !70,660^1400")
    // El impacto: primero el estallido blanco (construido como SONIDO_PUERTA) y luego un diente de sierra que cae a lo
    // más grave. Unos 0,5 s.
    const SONIDO_IMPACTO = new music.Melody("~5 @0,170,0,1 !240,1 ~2 @0,8,255,0 !180,320^24")
    // La fanfarria de la tarjeta del título, en re menor, como todo el juego: en este punto la historia todavía no
    // ha acabado bien.
    const SONIDO_FANFARRIA = new music.Melody("~16 @2,14,190,140 -190 D4:2 A4:2 D5:2 F5:6 R:1 F5:2 A5:2 D6:10")
    // Tormenta sobre el castillo: primero el estallido blanco del impacto, después el desgarro del camino del relámpago
    // y solo al final el rodar del trueno. Sin el golpe, el rodar solo sonaría como tráfico lejano.
    const SONIDO_TRUENO = new music.Melody("~5 @0,24,0,1 !2800,1"
        + " ~4 @0,3,215,0 !1800,70^300"
        + " ~5 @6,540,80,0 !96,660^30")
    // El ladrón se escabulle: ruido que se aleja silbando hacia arriba.
    const SONIDO_HUIDA = new music.Melody("~5 @2,14,110,0 !260,220^1500")
    // Tarjeta del estudio, última imagen: el logo se queda quieto. Dos voces, las dos de 2,0 s exactos (veinte unidades
    // de 100 ms cada una, a ritmo -150). Arriba, un acorde de re mayor que sube dos octavas ...
    const SONIDO_LOGO_AGUDO = new music.Melody("~16 @6,26,150,220 -150"
        + " D4:2 A4:2 D5:2 F#5:2 A5:4 D6:8")
    // ... abajo, la cadencia re - la - re como cimiento.
    const SONIDO_LOGO_GRAVE = new music.Melody("~1 @18,40,165,260 -150"
        + " D3:8 A2:4 D3:8")

    // --- Desarrollo ---
    // Piso superado: una fanfarria pequeña que acaba arriba.
    const SONIDO_PISO_SUPERADO = new music.Melody("~15 @2,12,150,90 -300 C5:1 E5:1 G5:2 C6:2 G5:2 C6:6")
    // El jefe aparece: un rugido que crece y después un motivo grave de diente de sierra con un tritono (do -> fa#),
    // disonante a propósito.
    const SONIDO_JEFE_APARECE = new music.Melody(
        "~5 @150,2,110,200 !1,300 ~2 @10,2,235,120 -150 C3:2 R:1 C3:2 R:1 F#3:3 G3:8")
    // Puerta cerrada: primero el golpe seco y después el eco sordo.
    const SONIDO_PUERTA = new music.Melody("~5 @0,90,0,1 !200,1 ~4 @0,10,200,0 !130,150^38")
    // Fin de la partida: baja de semitono en semitono (sol, fa#, fa, mi, re#) y el último tono, el do, es
    // grave y grueso.
    const SONIDO_FIN_PARTIDA = new music.Melody(
        "~15 @2,16,160,110 -200 G4:2 F#4:2 F4:2 E4:2 ~2 @6,2,190,300 D#4:2 C4:10")
    // Antes de la coronación: campanas lentas con mucho aire. Unos 1,8 s, más o menos lo que dura la cámara lenta
    // (PASOS_CORONACION_MS en epilogo.ts, 1,65 s).
    const SONIDO_CAMPANAS = new music.Melody("~3 @2,420,60,340 -100 D6:2 R:2 A6:2 R:1 D7:5")
    // LA CORONACIÓN: el golpe de luz y después una fanfarria ascendente, y en RE MAYOR (fa# en lugar de fa). Todo el
    // juego está en re menor; aquí se resuelve por primera vez. Unos 1,9 s.
    const SONIDO_CORONA = new music.Melody("~5 @1,40,0,1 !800,1"
        + " ~16 @2,12,205,130 -180 D5:1 F#5:1 A5:1 D6:1 F#6:2 A6:2 F#6:2 D6:12")
    // Los créditos: el mismo tema que la música del título (re, fa, la, sol, fa, mi, re), pero en RE MAYOR, más
    // tranquilo y cálido, con onda de seno. Quien conoce el juego oye la liberación sin saber por qué. Unos 3,25 s.
    const SONIDO_CREDITOS = new music.Melody(
        "~3 @18,6,160,240 -120 D4:2 F#4:2 A4:4 G4:2 F#4:2 E4:4 D4:2 C#4:2 D4:6")

    // --- Música ---
    // La música del título, la de la intro y la de la victoria son a DOS VOCES: dos objetos Melody que se repiten por
    // separado (cada uno suena en su propio hilo); la música de la mazmorra es a una sola voz. Para que las voces no se
    // desfasen, la aguda y la grave tienen siempre EL MISMO ritmo y el MISMO número de unidades de duración. El
    // analizador cuenta una unidad como Math.idiv(15000, ritmo): los ritmos 100, 125 y 150 salen exactos, así que el
    // desfase se queda pequeño y constante y no crece.

    // Tema del título, en re menor, 8 compases de 16 unidades a ritmo 125, o sea 15,36 s por vuelta. Anacrusas con
    // puntillo; en el tercer compás hay un salto de octava hasta re 5 y un sol# 4: el tritono sobre el bajo en re. El
    // compás 7 baja de fa 5 por mi 5 y re 5 hasta do# 5.
    const MUSICA_TITULO = new music.Melody("~2 @6,30,150,90 -125"
        + " D4:3 D4:1 A4:6 A#4:2 A4:4"
        + " G4:3 G4:1 F4:6 E4:2 D4:4"
        + " D5:6 A4:2 F4:4 G#4:4"
        + " A4:12 R:4"
        + " F4:3 F4:1 C5:6 A#4:2 A4:4"
        + " D5:3 D5:1 C5:6 A#4:2 A4:4"
        + " F5:4 E5:4 D5:4 C#5:4"
        + " D5:8 A4:4 D4:4")
    // El apoyo grave: un bajo de quintas con el mismo pulso con puntillo, con triángulo en lugar de diente de sierra,
    // para que sostenga sin rascar. Cada compás suma 3+1+4+3+1+4 = 16 unidades, justo lo que la melodía. La nota más
    // grave es la2 (110 Hz): por debajo, el altavoz pequeño suena flojo.
    const MUSICA_TITULO_GRAVE = new music.Melody("~1 @2,22,140,60 -125"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A3:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A2:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 D4:4"
        + " A2:3 A2:1 A2:4 A2:3 A2:1 E3:4"
        + " F3:3 F3:1 F3:4 F3:3 F3:1 C4:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A3:4"
        + " A#2:3 A#2:1 A#2:4 A2:3 A2:1 A2:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A2:4")

    // Fondo de la intro: modo frigio sobre re, con los roces de semitono mi bemol - re y si bemol - la. Un pulso de
    // latido hecho de tono y silencio, 8 compases de 16 unidades a ritmo 100, o sea 19,2 s por vuelta: tan largo que
    // casi no se nota la repetición.
    const MUSICA_INTRO = new music.Melody("~1 @2,90,60,150 -100"
        + " D3:2 R:2 D3:2 R:2 D3:2 R:2 D3:2 R:2"
        + " D3:2 R:2 D3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " D3:2 R:2 D3:2 R:2 C3:2 R:2 D3:2 R:2"
        + " A#2:2 R:2 A#2:2 R:2 A2:2 R:2 A2:2 R:2"
        + " D3:2 R:2 D3:2 R:2 D3:2 R:2 D#3:2 R:2"
        + " F3:2 R:2 F3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " G3:2 R:2 F3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " A2:2 R:2 A2:2 R:2 A#2:2 R:2 A2:2 R:2")
    // Encima, solo tres acentos en 19 segundos; casi todo es silencio. El ataque suave y la extinción larga hacen que
    // suenen desde muy lejos. Esta voz también cuenta 128 unidades.
    const MUSICA_INTRO_AGUDA = new music.Melody("~16 @25,140,55,320 -100"
        + " R:16 R:16"
        + " R:8 A5:4 R:4"
        + " R:16"
        + " R:12 A#5:2 A5:2"
        + " R:16"
        + " R:8 D#5:4 D5:4"
        + " R:16")

    // Música de la victoria para el epílogo: RE MAYOR, la misma tónica que el tema del título en re menor, pero
    // aclarada. 4 compases de 16 unidades a ritmo 100, o sea 9,6 s. Diente de sierra como fanfarria, punto más alto en
    // si 5 en el tercer compás y vuelta a re 5.
    const MUSICA_VICTORIA = new music.Melody("~2 @5,25,175,110 -100"
        + " D5:3 D5:1 F#5:4 A5:8"
        + " A5:2 G5:2 F#5:4 E5:4 D5:4"
        + " E5:3 E5:1 G5:4 B5:8"
        + " A5:6 F#5:2 D5:8")
    // Bajo que camina en negras sobre re, la y sol: una cadencia entera. 64 unidades, igual de larga que la fanfarria.
    const MUSICA_VICTORIA_GRAVE = new music.Melody("~1 @3,25,150,90 -100"
        + " D3:4 D3:4 A3:4 D3:4"
        + " D3:4 D3:4 A2:4 A2:4"
        + " G3:4 G3:4 D3:4 D3:4"
        + " D3:4 D3:4 A2:4 D3:4")

    // Apunta a la música de fondo que suena ahora, para poder pararla a propósito sin cortar los sonidos cortos
    // (music.stopAllSounds lo pararía todo). musicaSegundaVoz es la voz de apoyo; puede ser null, y entonces la pieza
    // suena a una voz (como el bucle de la mazmorra).
    let musicaPrincipal: music.Melody = null
    let musicaSegundaVoz: music.Melody = null

    // Arranca la música de fondo. Desde aquí los dos objetos Melody siguen en hilos propios y quien llama no se
    // detiene. Para música a una voz, pasa null como segunda.
    function iniciarMusica(principal: music.Melody, volumenPrincipal: number,
        segunda: music.Melody, volumenSegunda: number) {
        pararMusica()
        musicaPrincipal = principal
        musicaSegundaVoz = segunda
        // Primero la voz de apoyo y luego la melodía: la pequeña ventaja del bajo no se nota; al revés, la melodía
        // se oiría retrasada.
        if (musicaSegundaVoz != null) {
            musicaSegundaVoz.loop(volumenSegunda)
        }
        musicaPrincipal.loop(volumenPrincipal)
    }

    // Reproduce un sonido corto en segundo plano. Vuelve enseguida y el juego sigue sin tirones.
    function reproducirBreve(melodia: music.Melody, volumen: number) {
        melodia.play(volumen)
    }

    // --- Combate ---
    export function sonarDisparo() {
        reproducirBreve(SONIDO_DISPARO, VOLUMEN_SUAVE)
    }
    export function sonarGolpe() {
        reproducirBreve(SONIDO_GOLPE, VOLUMEN_MEDIO)
    }
    export function sonarEscudo() {
        reproducirBreve(SONIDO_ESCUDO, VOLUMEN_MEDIO)
    }
    export function sonarEnemigoDesvanecido() {
        reproducirBreve(SONIDO_ENEMIGO_DESVANECIDO, VOLUMEN_MEDIO)
    }
    export function sonarJefeDesvanecido() {
        reproducirBreve(SONIDO_JEFE_DESVANECIDO, VOLUMEN_PLENO)
    }
    export function sonarHeroeGolpeado() {
        reproducirBreve(SONIDO_HEROE_GOLPEADO, VOLUMEN_PLENO)
    }

    // --- Objetos ---
    export function sonarLlave() {
        reproducirBreve(SONIDO_LLAVE, VOLUMEN_MEDIO)
    }
    export function sonarCorazon() {
        reproducirBreve(SONIDO_CORAZON, VOLUMEN_MEDIO)
    }
    export function sonarMoneda() {
        reproducirBreve(SONIDO_MONEDA, VOLUMEN_SUAVE)
    }
    export function sonarAntorcha() {
        reproducirBreve(SONIDO_ANTORCHA, VOLUMEN_MEDIO)
    }
    export function sonarCofre() {
        reproducirBreve(SONIDO_COFRE, VOLUMEN_PLENO)
    }

    // --- Intro ---
    export function sonarJingleEstudio() {
        reproducirBreve(SONIDO_JINGLE_ESTUDIO, VOLUMEN_PLENO)
    }
    export function sonarTrueno() {
        reproducirBreve(SONIDO_TRUENO, VOLUMEN_PLENO)
    }
    export function sonarHuida() {
        reproducirBreve(SONIDO_HUIDA, VOLUMEN_MEDIO)
    }
    export function sonarAcercamiento() {
        reproducirBreve(SONIDO_ACERCAMIENTO, VOLUMEN_MEDIO)
    }
    export function sonarImpacto() {
        reproducirBreve(SONIDO_IMPACTO, VOLUMEN_PLENO)
    }
    export function sonarFanfarria() {
        reproducirBreve(SONIDO_FANFARRIA, VOLUMEN_PLENO)
    }
    // El logo se queda quieto: dos voces a la vez, las dos de 2,0 s.
    export function sonarLogoQuieto() {
        reproducirBreve(SONIDO_LOGO_GRAVE, VOLUMEN_GRAVES)
        reproducirBreve(SONIDO_LOGO_AGUDO, VOLUMEN_TITULO)
    }

    // --- Desarrollo ---
    export function sonarPisoSuperado() {
        reproducirBreve(SONIDO_PISO_SUPERADO, VOLUMEN_PLENO)
    }
    export function sonarJefeAparece() {
        reproducirBreve(SONIDO_JEFE_APARECE, VOLUMEN_PLENO)
    }
    export function sonarPuertaCerrada() {
        reproducirBreve(SONIDO_PUERTA, VOLUMEN_PLENO)
    }
    export function sonarFinPartida() {
        reproducirBreve(SONIDO_FIN_PARTIDA, VOLUMEN_PLENO)
    }
    // Antes de la coronación: el tiempo se hace lento, campanas de lejos.
    export function sonarCampanas() {
        reproducirBreve(SONIDO_CAMPANAS, VOLUMEN_MEDIO)
    }
    // La corona se posa sobre el héroe.
    export function sonarCorona() {
        reproducirBreve(SONIDO_CORONA, VOLUMEN_PLENO)
    }
    // Los créditos: el tema del título, resuelto hacia el modo mayor.
    export function sonarCreditos() {
        reproducirBreve(SONIDO_CREDITOS, VOLUMEN_PLENO)
    }

    // --- Música ---
    // Tema del título, a dos voces, en bucle continuo.
    export function iniciarMusicaTitulo() {
        iniciarMusica(MUSICA_TITULO, VOLUMEN_TITULO, MUSICA_TITULO_GRAVE, VOLUMEN_GRAVES)
    }

    // Fondo de la intro. Acompaña la historia Y los carteles del tutorial; intro.liberarLienzo() la detiene.
    export function iniciarMusicaIntro() {
        iniciarMusica(MUSICA_INTRO, VOLUMEN_MUSICA, MUSICA_INTRO_AGUDA, VOLUMEN_LEJANO)
    }

    // Música de la victoria en el epílogo; suena hasta las tarjetas finales (epilogo.reproducir la detiene allí).
    export function iniciarMusicaVictoria() {
        iniciarMusica(MUSICA_VICTORIA, VOLUMEN_TITULO, MUSICA_VICTORIA_GRAVE, VOLUMEN_GRAVES)
    }

    // Bucle de la mazmorra. Un ostinato grave y palpitante en re menor. Hasta el piso 9 el ritmo se acelera con cada
    // piso (100 + 12 por piso, como mucho 200); a partir del piso 4 se le cuelga una respuesta torcida con sol# (el
    // tritono respecto a re). Adrede está muy desnudo: suena todo el rato.
    export function iniciarMusicaMazmorra(piso: number) {
        let pulsosPorMinuto: number;
        let patron: string;
        pararMusica()
        pulsosPorMinuto = 100 + piso * 12
        if (pulsosPorMinuto > 200) {
            pulsosPorMinuto = 200
        }
        patron = "~17 @4,2,80,70 -" + convertToText(pulsosPorMinuto) + " D3:2 R:2 D3:2 A3:2 D3:2 R:2 F3:2 E3:2"
        if (piso >= 4) {
            patron = patron + " G#3:2 A3:2 G#3:2 D3:4"
        }
        iniciarMusica(new music.Melody(patron), VOLUMEN_MUSICA, null, 0)
    }

    // Para las dos capas de la música de fondo. Los sonidos cortos que todavía se están apagando pueden
    // terminar de sonar.
    export function pararMusica() {
        if (musicaPrincipal != null) {
            musicaPrincipal.stop()
            musicaPrincipal = null
        }
        if (musicaSegundaVoz != null) {
            musicaSegundaVoz.stop()
            musicaSegundaVoz = null
        }
    }
}
