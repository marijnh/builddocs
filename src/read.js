var fs = require("fs")
var glob = require("glob")
var getdocs = require("getdocs")

exports.read = function(config) {
  var items = Object.create(null), text = ""
  filesFor(config).forEach(function(filename) {
    var file = fs.readFileSync(filename, "utf8")
    getdocs.gather(file, filename, items)
    var extraText = getExtra(file)
    if (extraText) text = (text ? text + "\n\n" : "") + extraText
  })
  return {extraText: text,
          items: items,
          all: gatherAll({properties: items}, Object.create(null))}
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

function getExtra(text) {
  var match = /(?:\n|^)\s*\/\/(\s*)!!(.*(?:\n *\/\/.*)*)/.exec(text)
  if (match) return match[2].replace(/\n\s*\/\/ ?/g, "\n")
}

function gatherAll(obj, target) {
  if (obj.id) target[obj.id] = obj
  if (obj.constructor) target[obj.constructor.id] = obj.constructor
  if (obj.properties) for (var prop in obj.properties) gatherAll(obj.properties[prop], target)
  if (obj.staticProperties) for (var prop in obj.staticProperties) gatherAll(obj.staticProperties[prop], target)
  return target
}
