let fs = require("fs")
let glob = require("glob")
let getdocs = require("getdocs")

exports.read = function(config) {
  let items = Object.create(null)
  let files = config.files.split(" ").reduce(function(set, pat) {
    return set.concat(glob.sync(pat))
  }, [])
  files.forEach(function(filename) {
    let file = fs.readFileSync(filename, "utf8")
    getdocs.gather(file, {filename, items})
  })

  return {
    items,
    all: gatherAll({properties: items}, Object.create(null))
  }
}

function gatherAll(obj, target) {
  if (obj.id) target[obj.id] = obj
  if (Object.prototype.hasOwnProperty.call(obj, "constructor")) gatherAll(obj.constructor, target)
  if (obj.properties) for (let prop in obj.properties) gatherAll(obj.properties[prop], target)
  if (obj.staticProperties) for (let prop in obj.staticProperties) gatherAll(obj.staticProperties[prop], target)
  return target
}
