// Menú de pausa y pantalla final del juego, con los textos de textos.ts.
namespace catalogo {
    function abrirMenuPausa(): void {
        if (menuAbierto) return
        menuAbierto = true
        game.pushScene()
        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
        let elegido = 0
        const cantidad = 2
        const pantallaMenu = scene.createRenderable(250, function (lienzo: Image) {
            lienzo.fill(15)
            lienzo.printCenter(texto(IdTexto.PAUSA), 18, 5, image.font8)
            lienzo.printCenter(texto(IdTexto.CONTINUAR), 46, elegido == 0 ? 5 : 1, image.font8)
            lienzo.printCenter(formatear(IdTexto.SONIDO_VOLUMEN, music.volume()), 64,
                elegido == cantidad - 1 ? 5 : 1, image.font8)
        })
        while (controller.menu.isPressed() || controller.A.isPressed() || controller.B.isPressed()) pause(20)
        let arribaAntes = false
        let abajoAntes = false
        let aAntes = false
        let cerrar = false
        while (!cerrar) {
            const arribaAhora = controller.up.isPressed()
            const abajoAhora = controller.down.isPressed()
            const aAhora = controller.A.isPressed()
            if (arribaAhora && !arribaAntes) elegido = (elegido + cantidad - 1) % cantidad
            if (abajoAhora && !abajoAntes) elegido = (elegido + 1) % cantidad
            if (controller.B.isPressed() || controller.menu.isPressed()) cerrar = true
            if (aAhora && !aAntes) {
                if (elegido == 0) cerrar = true
                else if (elegido == cantidad - 1) {
                    const volumen = music.volume() == 0 ? 128 : 0
                    music.setVolume(volumen)
                    settings.writeNumber("#volume", volumen)
                }
            }
            arribaAntes = arribaAhora
            abajoAntes = abajoAhora
            aAntes = aAhora
            pause(20)
        }
        while (controller.A.isPressed() || controller.B.isPressed() || controller.menu.isPressed()) pause(20)
        pantallaMenu.destroy()
        game.popScene()
        menuAbierto = false
    }
    export function instalarMenus(): void {
        controller.menu.onEvent(ControllerButtonEvent.Pressed, abrirMenuPausa)
        game.onGameOver(function (victoria: boolean) {
            info.saveHighScore()
            const puntuacion = info.score()
            const mejor = info.highScore()
            game.pushScene()
            controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
            scene.createRenderable(250, function (lienzo: Image) {
                lienzo.fill(15)
                lienzo.printCenter(texto(victoria ? IdTexto.GANADO : IdTexto.PARTIDA_TERMINADA),
                    26, victoria ? 5 : 2, image.font8)
                lienzo.printCenter(formatear(IdTexto.PUNTOS, puntuacion), 52, 1, image.font8)
                lienzo.printCenter(formatear(IdTexto.RECORD, mejor), 69, 5, image.font8)
                lienzo.printCenter(texto(IdTexto.REINICIAR), 98, 1, image.font8)
            })
            esperarNuevaA(1000)
            // Al reiniciar se vuelve a la imagen del título, sin pasar por la intro (mira marcaReinicio en textos.ts).
            // La pausa corta le da tiempo al simulador para guardar la marca: con «makecode serve», control.reset()
            // recarga la página entera y el cargador solo escribe los ajustes cada 200 ms (en la consola de verdad,
            // settings escribe al instante en la memoria flash).
            settings.writeNumber(marcaReinicio, 1)
            pause(300)
            control.reset()
        })
    }

    // Espera a que se pulse A DE NUEVO, y no antes de bloqueoMs. Quien mantiene A pulsada o la machaca en el último
    // golpe (A también es el botón de disparo) no se salta así el texto del final sin haberlo leído.
    export function esperarNuevaA(bloqueoMs: number): void {
        const bloqueadoHastaMs = control.millis() + bloqueoMs
        let aAntes = true
        while (true) {
            const aAhora = controller.A.isPressed()
            if (aAhora && !aAntes && control.millis() >= bloqueadoHastaMs) break
            aAntes = aAhora
            pause(20)
        }
    }

    // Parte un texto en líneas de como mucho anchoMax caracteres. Después de un punto («.») empieza siempre una línea
    // nueva, para que «Puntos: 345» se quede junto. Un «:» suelto (como en francés) se queda pegado a
    // la palabra anterior.
    export function partirEnLineas(mensaje: string, anchoMax: number): string[] {
        const palabras = mensaje.split(" ")
        const lineas: string[] = []
        let linea = ""
        for (let i = 0; i < palabras.length; i++) {
            let palabra = palabras[i]
            if (i + 1 < palabras.length && palabras[i + 1] == ":") {
                palabra = palabra + " :"
                i++
            }
            if (linea.length == 0) linea = palabra
            else if (linea.length + 1 + palabra.length <= anchoMax) linea = linea + " " + palabra
            else {
                lineas.push(linea)
                linea = palabra
            }
            if (palabra.charAt(palabra.length - 1) == ".") {
                lineas.push(linea)
                linea = ""
            }
        }
        if (linea.length > 0) lineas.push(linea)
        return lineas
    }

    // El texto del final de la partida (FIN_PARTIDA) en un cuadro propio sobre la imagen parada del juego. Con
    // game.showLongText bastaría una pulsación nueva en el primer fotograma, y quien machaca A no vería ni el texto ni
    // los puntos. Aquí A cuenta solo pasado un segundo, y entonces aparece el aviso PULSA_A.
    export function mostrarDespedida(mensaje: string): void {
        const lineas = partirEnLineas(mensaje, 22)
        game.pushScene()
        game.currentScene().flags |= scene.Flag.SeeThrough
        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
        let listo = false
        const alto = lineas.length * 11 + 26
        const margenSuperior = (120 - alto) >> 1
        const cuadro = scene.createRenderable(250, function (lienzo: Image) {
            lienzo.fillRect(8, margenSuperior, 144, alto, 1)
            lienzo.drawRect(8, margenSuperior, 144, alto, 12)
            lienzo.drawRect(9, margenSuperior + 1, 142, alto - 2, 11)
            for (let i = 0; i < lineas.length; i++) {
                lienzo.printCenter(lineas[i], margenSuperior + 8 + i * 11, 15, image.font8)
            }
            if (listo) lienzo.printCenter(texto(IdTexto.PULSA_A), margenSuperior + alto - 14, 12, image.font8)
        })
        control.runInParallel(function () {
            pause(1000)
            listo = true
        })
        esperarNuevaA(1000)
        cuadro.destroy()
        game.popScene()
    }
}
