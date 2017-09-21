<<in {item, name, static, depth=0}>>

<<h " ".repeat(depth)>> * <<if static>>`static `<</if>>
   <<if item.type == "Function" && !item.optional>>
     <<if /\.constructor$/.test(item.id)>>`new `<</if>>**`<<h name>>`**`<<fntype item>>`
   <<else>>
     **`<<h name>>`**<<if item.type>>`: <<type item>>`<</if>>
   <</if>>
   <<if item.description>>\␤<<indent {text: item.description, depth: depth + 3}>><</if>>␤␤
   <<for name, prop in item.properties || {}>>
     <<if hasDescription(prop)>>
       <<define {item: prop, name: name, depth: depth + 3}>>
    <</if>>
  <</for>>
  <<for param item.params || []>>
    <<if hasDescription(param)>>
      <<define {item: param, name: param.name, depth: depth + 3}>>
    <</if>>
  <</for>>
  <<if item.returns && hasDescription(item.returns)>>
    <<define {item: item.returns, name: "returns", depth: depth + 3}>>
  <</if>>
