<<in {item, name, depth=0}>>

<<h " ".repeat(depth)>> * type **`<<h name>>`**
   `<<if item.typeParams>>< <<for elt item.typeParams>><<if $i>>, <</if>><<type elt>><</for>> ><</if>> = <<type item.value>>`
   <<if item.description>>\␤<<indent {text: item.description, depth: depth + 3}>><</if>>␤␤
   <<for name, prop in item.value.properties || {}>>
     <<if hasDescription(prop)>>
       <<define {item: prop, name: name, depth: depth + 3}>>
    <</if>>
  <</for>>
