var fs = require("fs")
var Mold = require("mold-template")
var markdown = require("markdown-it")

var read = require("./read").read

var knownTypes = {
  string: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String",
  bool: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean",
  number: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number",
  Iterator: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols",
  Array: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
  Object: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object",
  RegExp: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp",
  DOMNode: "https://developer.mozilla.org/en-US/docs/Web/API/Node",
  DOMFragment: "https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment",
  DOMDocument: "https://developer.mozilla.org/en-US/docs/Web/API/Document",
  DOMEvent: "https://developer.mozilla.org/en-US/docs/Web/API/Event",
  KeyboardEvent: "https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent",
  MouseEvent: "https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent",
  Error: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error",
  any: false,
  union: false,
  constructor: false,
  T: false
}

exports.build = function(config, readData) {
  if (!readData) readData = read(config)

  var cx = new Context(config, readData)
  return cx.mold.defs.module()
}

function Context(config, data) {
  this.config = config
  this.data = data

  this.knownTypes = Object.create(null)
  for (var prop in knownTypes) this.knownTypes[prop] = knownTypes[prop]
  if (config.knownTypes) for (var prop in config.knownTypes) this.knownTypes[prop] = config.knownTypes[prop]

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
    fs.readdirSync().forEach(function(filename) {
      var match = /^(.*?)\.html$/.exec(filename)
      if (match && !(match[1] in mold.defs))
        mold.bake(match[1], fs.readFileSync(dir + match[1] + ".html", "utf8").trim())
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
    functionIn: function(items) {
      var functions = []
      for (var prop in items)
        if (items[prop].type == "Function") functions.push(items[prop])
      return functions
    },
    variablesIn: function(items) {
      var variables = []
      for (var prop in items) {
        var type = items[prop].type
        if (type != "class" || type == "interface" || type == "Function") variables.push(items[prop])
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
    maybeLinkTo: function(name) {
      if (name in self.data.all) return "#" + name
      if (name.charAt(0) == '"') return null
      // FIXME sibling modules
      var known = self.knownTypes[name]
      if (known === false) return null
      if (known) return known
    },
    linkTo: function(name) {
      var link = env.linkTo(name)
      if (!link) throw new Error("Unknown link target: " + name)
      return link
    },
    anchor: function(item) {
      return self.config.name + "." + item.id
    }
  }
  if (this.config.env) for (var prop in this.config.env) env[prop] = this.config.env[prop]
  return env
}

function notEmpty(obj) {
  for (var _ in obj) return obj
}
