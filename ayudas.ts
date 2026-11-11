// Pequeñas funciones de ayuda, sin estado propio.

function valorAbsoluto (n: number) {
    if (n < 0) {
        return 0 - n
    }
    return n
}

function signo (n: number) {
    if (n > 0) {
        return 1
    }
    if (n < 0) {
        return -1
    }
    return 0
}

function esSuelo (x: number, y: number) {
    if (x < 0 || y < 0 || x >= CUADRICULA_ANCHO || y >= CUADRICULA_ALTO) {
        return false
    }
    return cuadricula[y * CUADRICULA_ANCHO + x] > 0
}
