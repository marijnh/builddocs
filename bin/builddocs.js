var fs = require("fs")

var build = require("../src/builddocs").build

var config = JSON.parse(fs.readFileSync(".builddocs", "utf8"))
if (!config.name) config.name = JSON.parse(fs.readFileSync("package.json", "utf8")).name

console.log(build(config))
