# builddocs

This is a utility that transforms code documented with
[getdocs](https://github.com/marijnh/getdocs-ts)-style doc comments
into HTML.

It exports the following values:

**`build`**`: (config: Object, items: ?Object) → string`

Build the documentation for a given set of files. The configuration
object may have the following fields:

 * **`name`**`: string` The name of this module.

 * **`filename`**`: string` If `items` isn't given, this should point
   at the main filename to extract docs from.

 * **`main`**`: ?string` The path to the main template, which should
   be a Markdown file with `@itemName` placeholders where the
   generated docs for the documented items in the source should be
   inserted. builddocs will complain when the set of item placeholders
   does not match the set of documented items. When not given, the
   items will be output in the order in which they are found.

 * **`mainText`**`: ?string` The main template as a string.

 * **`anchorPrefix`**`: ?string` Can be used to override the prefix
   used when generating HTML anchors. Defaults to the module name with
   a dot after it. You can set this to the empty string to disable
   anchor prefixes.

 * **`imports`**`: ?[Object | (item: Object) → ?string]` A set of object mapping type names to
   URLs. Will make the library recognize the given type names and
   properly link them.

 * **`qualifiedImports`**`: ?Object<Object<string>>` An object mapping
   prefixes to imports-like objects. For example, `{foo: {bar:
   "http://url"}}` will map the type `foo.bar` to the given URL.

 * **`allowUnresolvedTypes`**`: ?bool` Determines whether running into
   an unknown type should raise an error. Defaults to false (do raise
   an error).

 * **`templates`**`: ?string` May be the path of a directory with
   additional templates to load, which should have an `.html`
   extension and use [Mold](https://github.com/marijnh/mold) syntax.

 * **`env`**`: ?Object` A set of extra values to make available as
   global variables in the templates.

 * **`markdownOptions`**`: ?Object` A set of options to pass through
   to [markdown-it](https://github.com/markdown-it/markdown-it).

 * **`breakAt`**`: ?number` When given, type or property lists whose
   (estimated) length is equal to or greater than the given value will
   be wrapped in a `<div class=breaktype>` element (which can be
   styled with a left padding to indent it).

 * **`processType`**`: ?(type: Type) => ?Type` When given, types will
   be passed through this function before being formatted. It can
   return a replacement JSON structure for the type.

The second parameter, `items`, can be used if the JSON data for the
module has already been read. By default, `build` will read it using
[`getdocs-ts`](https://github.com/marijnh/getdocs-ts).

**`read`**`: (config: Object) → Object`

Read types and comments from a given set of files. `config` has the
same shape as the argument to `build` (though only `files` and `order`
will be read by this function).

The function returns the data returned by
[getdocs-ts](https://github.com/marijnh/getdocs-ts), an object containing
metadata for each of the items documented in the source files.

**`browserImports`**`: Object<string>`

An object mapping the types available in the browser (such as
`Document` and `Blob`) to their MDN URLs. Useable with the `imports`
or `qualifiedImports` options.

## License

This software is released under an MIT open-source license.
