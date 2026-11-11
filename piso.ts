// Construir un piso entero.

function construirPiso () {
    let salaLlave: number;
let sorteo: number;
let limiteCorazon: number;
limpiarPiso()
    let intentos = 0
    while (true) {
        vaciarCuadricula()
        crearSalas()
        intentos += 1
        // Salida de emergencia: crearSalas suele hacer entre 6 y 10 salas y con 4 basta casi seguro. Sin un tope, una
        // mala racha inundaría la memoria con cuadrículas nuevas.
        if (salaX.length >= 4 || intentos >= 8) {
            break;
        }
    }
    ultimaSala = salaX.length - 1
    cuadricula[salaY[ultimaSala] * CUADRICULA_ANCHO + salaX[ultimaSala]] = 2
    colocarTrampas()
    construirMosaicos()
    ponerDecorado()
    if (piso == 1) {
        ponerCuadroPared()
    }
    cantidadLlaves = 0
    marcadorLlave.setFlag(SpriteFlag.Invisible, true)
    tiles.placeOnTile(heroe, tiles.getTileLocation(salaX[0], salaY[0]))
    scene.cameraFollowSprite(heroe)
    // Hay un jefe cada PISOS_POR_JEFE pisos, y en el piso del jefe final siempre, aunque no sea múltiplo.
    jefeActivo = piso % PISOS_POR_JEFE == 0 || piso == PISO_JEFE_FINAL
    if (jefeActivo) {
        colocarEnemigo(salaX[ultimaSala], salaY[ultimaSala], 5)
    } else {
        // ultimaSala es la sala de la escalera. Si la llave cayera allí, estaría sobre el mosaico de la escalera y el
        // piso terminaría al cogerla. ultimaSala vale casi siempre 3 como mínimo (el bucle de arriba pide cuatro salas
        // y solo se rinde tras ocho intentos), así que el rango es válido.
        salaLlave = randint(1, ultimaSala - 1)
        ponerObjeto(salaX[salaLlave], salaY[salaLlave], 1)
    }
    for (let sala = 1; sala < ultimaSala + 1; sala++) {
        // También el enemigo normal cuenta para ENEMIGOS_MAX. otroEnemigo solo vigila el tope para el segundo y el
        // tercero: sin esta comprobación se añadirían enemigos normales sin parar en cuanto hubiera muchas salas,
        // aunque la lista ya estuviera llena. El jefe ya está en la lista: se pone antes de este bucle.
        if (listaEnemigos.length < ENEMIGOS_MAX) {
            colocarEnemigo(salaX[sala], salaY[sala], especieAlAzar())
        }
        // El segundo y el tercer enemigo se añaden poco a poco (mira otroEnemigo en enemigos.ts), con un pequeño
        // desplazamiento. Si no, quedarían exactamente uno sobre otro.
        if (otroEnemigo(SEGUNDO_DESDE_PISO, SEGUNDO_MAX)) {
            colocarEnemigo(salaX[sala], salaY[sala], especieAlAzar(), 1)
        }
        if (otroEnemigo(TERCERO_DESDE_PISO, TERCERO_MAX)) {
            colocarEnemigo(salaX[sala], salaY[sala], especieAlAzar(), 2)
        }
        // Cuanto más profundo, más veces hay un corazón en lugar de una moneda en la sala. Es una pequeña compensación
        // por los muchos enemigos y trampas de abajo.
        limiteCorazon = 2 + Math.min(Math.idiv(piso, PISOS_POR_BONO_CORAZON), BONO_CORAZON_MAX)
        sorteo = randint(0, 9)
        if (sorteo < limiteCorazon) {
            ponerObjeto(salaX[sala], salaY[sala], 2)
        } else if (sorteo < limiteCorazon + 2) {
            ponerObjeto(salaX[sala], salaY[sala], 3)
        } else if (sorteo < limiteCorazon + 4) {
            ponerObjeto(salaX[sala], salaY[sala], 4)
        } else {
            ponerObjeto(salaX[sala], salaY[sala], 5)
        }

    }
    // La antorcha que esté ardiendo termina con el piso. Si no se pusiera luzHastaMs a cero, quedaría una hora del
    // futuro y, al llegar esa hora, el radio ya estaría en LUZ_NORMAL: el cambio no serviría de nada.
    luzHastaMs = 0
    ponerLuz(LUZ_NORMAL)
    mostrarPiso()
    sonido.iniciarMusicaMazmorra(piso)
    if (jefeActivo) {
        if (piso == PISO_JEFE_FINAL) {
            heroe.sayText(catalogo.texto(catalogo.IdTexto.LADRON_CORONA), 2000, false)
        } else {
            heroe.sayText(catalogo.formatear(catalogo.IdTexto.PISO_JEFE, piso), 1800, false)
        }
        sonido.sonarJefeAparece()
    } else {
        heroe.sayText(catalogo.formatear(catalogo.IdTexto.PISO_GLOBO, piso), 1300, false)
    }
}
