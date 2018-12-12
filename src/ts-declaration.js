function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function createObjectDefinition (param) {
  let result = ''

  if (param.properties) {
    const object = Object.keys(param.properties)
      .map((x) => ({ name: x, ...param.properties[x]}))
      .map((x) => createParamDefinition(x, ': '))
      .join(', ')

    result = '{' + object + '}'
  } else {
    result = 'Object'
  }

  if (param.optional) {
    result += ' | void'
  }

  return result
}

function createParamDefinition (param, separator) {
  let name = (param.name || '')
  if (param.optional && param.type !== 'Object' && param.name) {
    name += '?'
  }

  name += ( separator || '' )

  if (param.type === 'Function') {
    name += capitalize(param.name)
  } else if (param.type === 'union') {
    const params = Object.values(param.typeParams)
      .map(x => createParamDefinition(x, ''))
      .filter(x => x !== 'null')
    name += params.join(' | ')
  } else if (param.type === 'Array') {
    const typeArray = createParamDefinition(param.typeParams[0], '')
    name += typeArray+'[]'
  } else if (param.type === 'Object') {
    name += createObjectDefinition(param)
  } else {
    name += param.type
  }

  return name
}

function createParamsFromFunctionDeclaration(functionDeclaration) {
  return (functionDeclaration.params || []).map(x => createParamDefinition(x, ': ')).join(', ')
}

function createReturnsFromFunctionDeclaration(functionDeclaration) {
  if (functionDeclaration.type === 'Function') {
    let functionParams = createParamsFromFunctionDeclaration(functionDeclaration)
    let functionReturns = ' => '+ createParamDefinition(functionDeclaration.returns, '')

    return '('+functionParams+')'+functionReturns
  }

  return createParamDefinition(functionDeclaration)
}

function createTSDeclaration(functionName, functionDeclaration) {
  let params = createParamsFromFunctionDeclaration(functionDeclaration)
  let returns = createReturnsFromFunctionDeclaration(functionDeclaration.returns)

  return 'export function '+functionName+'('+params+') : '+returns+''
}

exports.createTSDeclaration = createTSDeclaration
