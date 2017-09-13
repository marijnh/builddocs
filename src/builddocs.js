var fs = require("fs")
var Mold = require("mold-template")
var read = exports.read = require("./read").read
var builtins = require("./builtins")

exports.browserImports = require("./browser")

exports.build = function(config, data) {
  if (!data) data = read(config)

  var mdOptions = {html: true}
  if (config.markdownOptions) for (var prop in config.markdownOptions) mdOptions[prop] = config.markdownOptions[prop]
  var markdown = require("markdown-it")(mdOptions).use(require("markdown-it-deflist"))

  var placed = Object.create(null)
  var doc = markdown.render(fs.readFileSync(config.main, "utf8").replace(/(^|\n)@(\w+)(?=$|\n)/g, function(_, before, name, after) {
    if (placed[name]) throw new Error("Item " + name + " is included in doc template twice")
    if (!data.items[name]) throw new Error("Unknown item " + name + " included in doc template")
    placed[name] = true
    return before + before + '<div data-item="' + name + '"></div>\n'
  }))
  for (var name in data.items) if (!placed[name])
    throw new Error("Item " + name + " is missing from the doc template")

  var mold = loadTemplates(markdown, config, data)

  return doc.replace(/<div data-item="([^"]+)"><\/div>/g, function(_, name) {
    let item = data.items[name]
    return mold.defs.item({item: item, name: name})
  })
}

function prefix(config) {
  var prefix = config.anchorPrefix
  if (prefix == null) prefix = config.name + "."
  return prefix
}

function loadTemplates(markdown, config, data) {
  var mold = new Mold(moldEnv(config, data))
  mold.defs.markdown = function(text) {
    if (!text) return ""
    return markdown.render(config.markdownFilter ? config.markdownFilter(text) : text)
  }
  mold.defs.markdownFile = function(name) {
    return mold.defs.markdown(fs.readFileSync(name + ".md", "utf8"))
  }

  function templateDir(dir) {
    fs.readdirSync(dir).forEach(function(filename) {
      var match = /^(.*?)\.html$/.exec(filename)
      if (match && !(match[1] in mold.defs))
        mold.bake(match[1], fs.readFileSync(dir + "/" + match[1] + ".html", "utf8").trim())
    })
  }

  if (config.templates) templateDir(config.templates)
  templateDir(__dirname + "/../templates")

  return mold
}

function maybeLinkType(config, data, name) {
  if (name in data.all) return "#" + prefix(config) + name
  if (name.charAt(0) == '"') return false
  var imports = config.imports, qualified = config.qualifiedImports
  if (imports) for (var i = 0; i < imports.length; i++) {
    var set = imports[i]
    if (Object.prototype.hasOwnProperty.call(set, name))
      return set[name]
  }
  if (qualified) for (var pref in qualified) if (name.indexOf(pref + ".") == 0) {
    var inner = name.slice(pref.length + 1)
    if (Object.prototype.hasOwnProperty.call(qualified[pref], inner))
      return qualified[pref][inner]
  }
  if (builtins.hasOwnProperty(name)) return builtins[name]
}

function moldEnv(config, data) {
  var env = {
    prefix: prefix(config),
    linkType: function(type) {
      var link = maybeLinkType(config, data, type.type)
      if (!link && link !== false && !config.allowUnresolvedTypes)
        throw new Error("Unknown type '" + type.type + "' at " + type.loc.file + ":" + type.loc.line)
      return link
    },
    hasDescription: function(type) {
      if (type.description) return true
      if (type.properties) for (var prop in type.properties)
        if (env.hasDescription(type.properties[prop])) return true
      if (type.params) for (var i = 0; i < type.params.length; i++)
        if (env.hasDescription(type.params[i])) return true
      if (type.returns && type.returns.description) return true
      return false
    }
  }
  if (config.env) for (var prop in config.env) env[prop] = config.env[prop]
  return env
}
