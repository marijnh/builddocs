#!/usr/bin/env node
var fs = require("fs")

var build = require("../src/builddocs").build

var name, main, templates, allowUnresolvedTypes = true, filename, format = "html"

function help(status) {
  console.log("Usage: builddocs [--name <name>] [--main <main>] [--templates <templatedir>]\n         [--disallow-unresolved] [--help] [--format <format>] <filename>")
  process.exit(status)
}

for (var i = 2; i < process.argv.length; i++) {
  var arg = process.argv[i]
  if (arg == "--name") name = process.argv[++i]
  else if (arg == "--main") main = process.argv[++i]
  else if (arg == "--templates") templates = process.argv[++i]
  else if (arg == "--disallow-unresolved") allowUnresolvedTypes = false
  else if (arg == "--format") format = process.argv[++i]
  else if (arg.charAt(0) != "-" && !filename) filename = arg
  else help(arg == "--help" ? 0 : 1)
}

if (!filename) help(1)

console.log(build({
  name,
  main,
  filename,
  templates,
  format,
  allowUnresolvedTypes
}))
