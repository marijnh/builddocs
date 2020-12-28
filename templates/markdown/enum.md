<<in {item, name}>>

<<h " ".repeat(depth)>> * enum **`<<h name>>`**
   <<if item.description>>\␤<<indent {text: item.description, depth: depth + 3}>><</if>>␤␤
   <<for name, member in item.properties>>
     <<h " ".repeat(depth + 3)>> * **`<<h name>>`**
     <<if member.description>>\␤<<indent {text: member.description, depth: depth + 3}>><</if>>
   <</for>>
