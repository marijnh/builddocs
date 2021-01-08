let fs = require("fs")
let Mold = require("mold-template")
let builtins = require("./builtins")

exports.browserImports = require("./browser")

exports.build = function(config, items) {
  if (!items) items = require("getdocs-ts").gather(config)

  let format = config.format || "html"
  let renderItem =
      format == "html" ? name => '<div data-item="' + name + '"></div>' :
      format == "markdown" ? (() => {
        let mold = loadMarkdownTemplates(config, items)
        return name => mold.defs.item({item: items[name], name}).replace(/[\n␤]{2}$/g, "\n")
      })()
      : null

  let instantiateTemplate = template => {
    if (format == "html") template = template.replace(/(^|\n)(@\w+\n+)*@\w+(?=$|\n)/g, "<dl>\n$&\n</dl>")
    let placed = Object.create(null), problems = []
    let result = template.replace(/(^|\n)@(\w+)(?=$|\n)/g, function(_, before, name) {
      if (placed[name]) problems.push("Item " + name + " is included in doc template twice")
      if (!items[name]) problems.push("Unknown item " + name + " included in doc template")
      placed[name] = true
      return before + renderItem(name)
    })
    for (let name in items) if (!placed[name])
      problems.push("Item " + name + " is missing from the doc template")
    return {result, problems}
  }

  let main
  if (config.main || config.mainText) {
    let {problems, result} = instantiateTemplate(config.mainText || fs.readFileSync(config.main, "utf8"))
    if (problems.length)
      for (let prob of problems) console.log(prob)
    else
      main = result
  }
  if (!main) main = instantiateTemplate(Object.keys(items).map(name => "@" + name).join("\n\n")).result

  if (format == "markdown") {
    return main.replace(/␤/g, "\n")
  } else if (format == "html") {
    let mdOptions = {html: true}
    if (config.markdownOptions) for (let prop in config.markdownOptions) mdOptions[prop] = config.markdownOptions[prop]
    let markdown = require("markdown-it")(mdOptions).use(require("markdown-it-deflist"))
    let mold = loadHTMLTemplates(markdown, config, items)

    let doc = markdown.render(main)
    return doc.replace(/<div data-item="([^"]+)"><\/div>/g, function(_, name) {
      return mold.defs.item({item: items[name], name})
    })
  }
}

function prefix(config) {
  let prefix = config.anchorPrefix
  if (prefix == null) prefix = config.name ? config.name + "." : ""
  return prefix
}

function templateDir(mold, dir, ext) {
  fs.readdirSync(dir).forEach(function(filename) {
    let match = /^(.*?)\.(\w+)$/.exec(filename)
    if (match && match[2] == ext && !has(mold.defs, match[1]))
      mold.bake(match[1], fs.readFileSync(dir + "/" + filename, "utf8").trim())
  })
}

function loadHTMLTemplates(markdown, config, items) {
  let mold = new Mold(moldEnv(config, items))
  mold.defs.markdown = function(text) {
    if (!text) return ""
    return markdown.render(config.markdownFilter ? config.markdownFilter(text) : text)
  }
  mold.defs.markdownFile = function(name) {
    return mold.defs.markdown(fs.readFileSync(name + ".md", "utf8"))
  }

  if (config.templates) templateDir(mold, config.templates, "html")
  templateDir(mold, __dirname + "/../templates", "html")

  return mold
}

function loadMarkdownTemplates(config, items) {
  let mold = new Mold(moldEnv(config, items))

  if (config.templates) templateDir(mold, config.templates, "md")
  templateDir(mold, __dirname + "/../templates/markdown", "md")
  mold.defs.indent = function({text, depth}) {
    return text.trim().split("\n").map(line => /\S/.test(line) ? " ".repeat(depth) + line : "").join("\n")
  }

  return mold
}

function has(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

function isLiteral(type) {
  return /^(\"|\'|-?\d)/.test(type)
}

function maybeLinkType(config, items, type) {
  let name = type.type
  if (type.typeParamSource) return "#" + prefix(config) + type.typeParamSource
  if (has(items, name) && items[name].kind != "reexport") return "#" + prefix(config) + name
  if (isLiteral(name)) return false
  let imports = config.imports, qualified = config.qualifiedImports
  if (imports) for (let i = 0; i < imports.length; i++) {
    let set = imports[i]
    if (typeof set == "function") {
      let result = set(type)
      if (result) return result
    } else if (has(set, name)) {
      return set[name]
    }
  }
  if (qualified) for (let pref in qualified) if (name.indexOf(pref + ".") == 0) {
    let inner = name.slice(pref.length + 1)
    if (has(qualified[pref], inner))
      return qualified[pref][inner]
  }
  if (builtins.hasOwnProperty(name)) return builtins[name]
}

function moldEnv(config, items) {
  let env = {
    prefix: prefix(config),
    linkType: function(type) {
      let link = maybeLinkType(config, items, type)
      if (!link && link !== false && !config.allowUnresolvedTypes)
        throw new Error("Unknown type '" + type.type + "'" + (type.loc ? " at " + type.loc.file + ":" + type.loc.line : ""))
      return link
    },
    hasDescription: function(type) {
      if (type.description) return true
      if (type.properties) for (let prop in type.properties)
        if (env.hasDescription(type.properties[prop])) return true
      if (type.params) for (let i = 0; i < type.params.length; i++)
        if (env.hasDescription(type.params[i])) return true
      if (type.returns && type.returns.description) return true
      return false
    },
    breakType: function(type) {
      return config.breakAt != null && typeLen(type) >= config.breakAt
    },
    processType: function(type) {
      return (config.processType && config.processType(type)) || type
    }
  }
  if (config.env) for (let prop in config.env) env[prop] = config.env[prop]
  return env
}

const typeLenMap = {
  union: 1,
  intersection: 1,
  tuple: 2,
  Array: 2,
  ReadonlyArray: 11,
  indexed: 2,
  conditional: 6,
  mapped: 10,
  Function: 4
}

// Estimate the length of a type
function typeLen(type, extra = 0) {
  if (!type) return 0
  if (Array.isArray(type)) return type.reduce((compl, t, i) => compl + typeLen(t) + (i ? 2 : 0), extra)
  let val = extra + (typeLenMap.hasOwnProperty(type.type) ? typeLenMap[type.type] : type.type.length)
  if (type.kind == "parameter") val += (type.name?.length || 0) + 2
  val += typeLen(type.implements) +
    (type.default ? type.default.length + 3 : 0) +
    typeLen(type.typeArgs, 2)
  if (type.signatures) {
    let sig = type.signatures[0]
    val += typeLen(sig.params) + typeLen(sig.typeArgs, 2) + typeLen(sig.returns, 3)
  }
  if (type.properties) for (let name in type.properties) {
    let prop = type.properties[name]
    if (!prop.description) val += name.length + 2 + typeLen(prop)
  }
  return val
}
