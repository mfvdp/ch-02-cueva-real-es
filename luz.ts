// Oscuridad y luz: el círculo de visión alrededor del héroe.
//
// La imagen de la oscuridad mide 160 × 120 y está pegada a la cámara como sprite (RelativeToCamera). En cada fotograma
// el círculo de luz se pinta en la posición del héroe EN LA PANTALLA (dibujarOscuridad, llamada desde game.onUpdate en
// main.ts): son tres llamadas de relleno nativas por fotograma, que casi no cuestan nada.
//
// Una imagen del tamaño del mundo (320 × 240) ocuparía 38 KB de una sola vez: la mitad de toda la memoria, y todos los
// huecos libres quedarían partidos en dos. Con 160 × 120 son solo 9,6 KB.
//
// La imagen se crea UNA vez al arrancar (main.ts) y después solo se vuelve a pintar.

// Solo recuerda el radio que se quiere; el dibujo se rehace en cada fotograma.
function ponerLuz (radio: number) {
    radioLuz = radio
}

// Pinta la oscuridad: todo negro, un anillo de penumbra y en el centro el agujero de luz, centrado en la posición del
// héroe en la pantalla. Esa posición sale de su posición en el mundo menos el recuadro de la cámara, así el círculo
// sale bien aunque la cámara se quede parada en el borde del mapa.
function dibujarOscuridad () {
    if (imagenOscuridad == null || heroe == null) {
        return
    }
    let pantallaX = heroe.x - scene.cameraProperty(CameraProperty.Left)
    let pantallaY = heroe.y - scene.cameraProperty(CameraProperty.Top)
    imagenOscuridad.fill(15)
    imagenOscuridad.fillCircle(pantallaX, pantallaY, radioLuz + 6, 12)
    imagenOscuridad.fillCircle(pantallaX, pantallaY, radioLuz, 0)
}
