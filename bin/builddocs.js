var fs = require("fs")

var build = require("../src/builddocs").build

var name, main, templates, allowUnresolved = true, files = []

function help(status) {
  console.log("Usage: builddocs --name <name> --main <main> [--templates <templatedir>]\n         [--disallow-unresolved] [--help] <sourcefiles>")
  process.exit(status)
}

for (var i = 2; i < process.argv.length; i++) {
  var arg = process.argv[i]
  if (arg == "--name") name = process.argv[++i]
  else if (arg == "--main") main = process.argv[++i]
  else if (arg == "--templates") templates = process.argv[++i]
  else if (arg == "--disallow-unresolved") allowUnresolved = false
  else if (arg.charAt(0) != "-") files.push(arg)
  else help(arg == "--help" ? 0 : 1)
}

if (!main || !name || !files.length) help(1)

console.log(build({
  name: name,
  main: main,
  files: files.join(" "),
  templates: templates,
  allowUnresolvedTypes: allowUnresolved
}))
