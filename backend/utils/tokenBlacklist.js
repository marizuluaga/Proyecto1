// Como JWT no tiene "estado", para el logout guardamos los tokens revocados
// en memoria. OJO: si se reinicia el servidor se borra la lista
// (para algo mas serio se podria guardar en la bd o en redis)
const revocados = new Set();

function revocar(token) {
  revocados.add(token);
}

function estaRevocado(token) {
  return revocados.has(token);
}

module.exports = { revocar, estaRevocado };
