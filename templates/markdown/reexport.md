<<in {item, name, depth=0}>>

<<h " ".repeat(depth)>> * re-export <<if name != item.type>>`<<h item.type>> as` >><</if>>**`<<h name>>`**
