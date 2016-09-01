var fs = require("fs")
var glob = require("glob")
var getdocs = require("getdocs")

exports.read = function(config) {
  var items = Object.create(null), content = [], last
  var files = filesFor(config)
  files.forEach(function(filename) {
    last = null
    var file = fs.readFileSync(filename, "utf8")
    getdocs.gather(file, {
      filename: filename,
      items: items,
      onComment: function(block, text, _start, _end, startPos) {
        var m
        if (last && !block && startPos.line == last.loc.line + 1)
          last.text += "\n" + text
        else if (m = /^\s*!!(?:$|\s)/.exec(text))
          content.push(last = {loc: {line: startPos.line, file: filename}, text: text.slice(m[0].length)})
      }
    })
  })

  function isBefore(element, item) {
    var fDiff = files.indexOf(element.loc.file) - files.indexOf(item.loc.file)
    if (fDiff < 0) return true
    return fDiff == 0 && element.loc.line < item.loc.line
  }

  let pieces = [], i = 0
  for (let name in items) {
    let item = items[name]
    while (i < content.length && isBefore(content[i], item))
      pieces.push({content: getdocs.stripComment(content[i++].text)})
    pieces.push(item)
  }
  while (i < content.length)
    pieces.push({content: getdocs.stripComment(content[i++].text)})

  return {
    items: items,
    pieces: pieces,
    all: gatherAll({properties: items}, Object.create(null))
  }
}

function filesFor(config) {
  var files = config.files.split(" ").reduce(function(set, pat) {
    return set.concat(glob.sync(pat))
  }, [])
  if (!config.order) return files

  var ordered = config.order.split(" ").map(function(pat) {
    var re = new RegExp("\\/" + pat + "\\.\\w+$")
    for (var i = 0; i < files.length; i++)
      if (files[i].match(re)) return files.splice(i, 1)[0]
    throw new Error("Order pattern " + pat + " does not match a file")
  })
  return ordered.concat(files)
}

function gatherAll(obj, target) {
  if (obj.id) target[obj.id] = obj
  if (Object.prototype.hasOwnProperty.call(obj, "constructor")) gatherAll(obj.constructor, target)
  if (obj.properties) for (var prop in obj.properties) gatherAll(obj.properties[prop], target)
  if (obj.staticProperties) for (var prop in obj.staticProperties) gatherAll(obj.staticProperties[prop], target)
  return target
}
