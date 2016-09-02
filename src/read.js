var fs = require("fs")
var glob = require("glob")
var getdocs = require("getdocs")

exports.read = function(config) {
  var items = Object.create(null)
  var files = config.files.split(" ").reduce(function(set, pat) {
    return set.concat(glob.sync(pat))
  }, [])
  files.forEach(function(filename) {
    last = null
    var file = fs.readFileSync(filename, "utf8")
    getdocs.gather(file, {filename: filename, items: items})
  })

  return {
    items: items,
    all: gatherAll({properties: items}, Object.create(null))
  }
}

function gatherAll(obj, target) {
  if (obj.id) target[obj.id] = obj
  if (Object.prototype.hasOwnProperty.call(obj, "constructor")) gatherAll(obj.constructor, target)
  if (obj.properties) for (var prop in obj.properties) gatherAll(obj.properties[prop], target)
  if (obj.staticProperties) for (var prop in obj.staticProperties) gatherAll(obj.staticProperties[prop], target)
  return target
}
