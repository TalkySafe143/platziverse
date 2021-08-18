'use strict'

function pipe (source, target) {
  if (!source.emit || !target.emit) {
    throw TypeError('Please pass EventEmitter\'s arguments')
  }

  const emit = source._emit = source.emit

  source.emit = function () {
    console.log('Estamos emitiendo mensajes estos son los params', arguments)
    emit.apply(source, arguments)
    target.emit.apply(target, arguments)

    return source
  }
}

module.exports = { pipe }
