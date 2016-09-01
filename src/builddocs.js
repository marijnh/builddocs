var fs = require("fs")
var Mold = require("mold-template")
var markdown = (require("markdown-it")({html: true})).use(require("markdown-it-deflist"))

var read = exports.read = require("./read").read
var builtins = require("./builtins")

exports.browserImports = require("./browser")

exports.build = function(config, data) {
  if (!data) data = read(config)

  var cx = new Context(config, data)
  return cx.mold.defs.module()
}

function Context(config, data) {
  this.config = config
  this.data = data
  this.mold = this.loadTemplates()
}

Context.prototype.loadTemplates = function() {
  var mold = new Mold(this.moldEnv()), conf = this.config
  mold.defs.markdown = function(text) {
    if (!text) return ""
    return markdown.render(conf.markdownFilter ? conf.markdownFilter(text) : text)
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

  if (conf.templates) templateDir(conf.templates)
  templateDir(__dirname + "/../templates")

  return mold
}

Context.prototype.moldEnv = function() {
  var self = this, env = {
    module: this.config.name,
    moduleText: this.data.extraText,
    items: this.data.items,
    classesIn: function(items) {
      var classes = []
      for (var prop in items)
        if (items[prop].type == "class" || items[prop].type == "interface") classes.push(items[prop])
      return classes
    },
    functionsIn: function(items) {
      var functions = []
      for (var prop in items)
        if (items[prop].type == "Function") functions.push(items[prop])
      return functions
    },
    variablesIn: function(items) {
      var variables = []
      for (var prop in items) {
        var type = items[prop].type
        if (type != "class" && type != "interface" && type != "Function") variables.push(items[prop])
      }
      return variables
    },
    membersIn: function(cls) {
      var members = Object.create(null)
      if (cls.properties) for (var prop in cls.properties)
        if (cls.properties[prop].type != "Function") members[prop] = cls.properties[prop]
      return notEmpty(members)
    },
    methodsIn: function(cls) {
      var methods = Object.create(null)
      if (cls.properties) for (var prop in cls.properties)
        if (cls.properties[prop].type == "Function") methods[prop] = cls.properties[prop]
      return notEmpty(methods)
    },
    maybeLinkType: function(name) {
      if (name in self.data.all) return "#" + self.config.name + "." + name
      if (name.charAt(0) == '"') return false
      var imports = self.config.imports, qualified = self.config.qualifiedImports
      if (imports) for (var i = 0; i < imports.length; i++) {
        var set = imports[i]
        if (Object.prototype.hasOwnProperty.call(set, name))
          return set[name]
      }
      if (qualified) for (var prefix in qualified) if (name.indexOf(prefix + ".") == 0) {
        var inner = name.slice(prefix.length + 1)
        if (Object.prototype.hasOwnProperty.call(qualified[prefix], inner))
          return qualified[prefix][inner]
      }
      if (builtins.hasOwnProperty(name)) return builtins[name]
    },
    linkType: function(type) {
      var link = env.maybeLinkType(type.type)
      if (!link && link !== false && !self.config.allowUnresolvedTypes)
        throw new Error("Unknown type '" + type.type + "' at " + type.loc.file + ":" + type.loc.line)
      return link
    },
    anchor: function(item) {
      return self.config.name + "." + item.id
    },
    itemName: function(item) {
      return /[^\.^]+$/.exec(item.id)[0]
    },
    hasDescription: function(type) {
      if (type.description) return true
      if (type.properties) for (let prop in type.properties)
        if (env.hasDescription(type.properties[prop])) return true
      if (type.params) for (let i = 0; i < type.params.length; i++)
        if (env.hasDescription(type.params[i])) return true
      if (type.returns && type.returns.description) return true
      return false
    }
  }
  if (this.config.env) for (var prop in this.config.env) env[prop] = this.config.env[prop]
  return env
}

function notEmpty(obj) {
  for (var _ in obj) return obj
}
