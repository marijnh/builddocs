<<in {item, name, depth=0}>>

<<h " ".repeat(depth)>> * re-export <<if name != item.value.type>>`<<h item.value.type>> as` >><</if>>**`<<h name>>`**
