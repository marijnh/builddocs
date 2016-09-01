var fs = require("fs")
var Mold = require("mold-template")
var markdown = (require("markdown-it")({html: true})).use(require("markdown-it-deflist"))

var read = exports.read = require("./read").read
var builtins = require("./builtins")

exports.browserImports = require("./browser")

exports.build = function(config, data) {
  if (!data) data = read(config)

  var cx = new Context(config, data)
  return {text: cx.mold.defs.module(),
          headings: cx.headings}
}

function Context(config, data) {
  this.config = config
  this.prefix = config.anchorPrefix == null ? config.name + "." : config.anchorPrefix
  this.data = data
  this.headings = []
  var self = this
  this.pieces = data.pieces.map(function(item) {
    if (!item.content) return item
    return {content: item.content.replace(/(^|\n)\s*#+\s*(.*)/, function(_, before, head) {
      var id = self.prefix + head.replace(/\W+/g, "_")
      self.headings.push({name: head, id: id})
      return before + "### <a href=\"#" + id + "\" id=\"" + id + "\">" + head + "</a>"
    })}
  })
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

function maybeLinkType(self, name) {
  if (name in self.data.all) return "#" + self.prefix + name
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
}

Context.prototype.moldEnv = function() {
  var contentPos = 0

  var self = this, env = {
    moduleName: this.config.name,
    prefix: this.prefix,
    moduleText: this.data.extraText,
    items: this.data.items,
    pieces: this.pieces,
    linkType: function(type) {
      var link = maybeLinkType(self, type.type)
      if (!link && link !== false && !self.config.allowUnresolvedTypes)
        throw new Error("Unknown type '" + type.type + "' at " + type.loc.file + ":" + type.loc.line)
      return link
    },
    anchor: function(item) {
      return self.prefix + item.id
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
