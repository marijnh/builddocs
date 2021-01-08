<<in {item, name, static, abstract, depth=0}>>

<<h " ".repeat(depth)>> * <<if abstract>>`abstract `<</if>><<if static>>`static `<</if>>
   <<if item.type == "Function" && !item.optional>>
     <<if item.signatures[0].type == "constructor">>`new `<</if>>**`<<h name>>`**`<<fntype item.signatures[0]>>`
   <<else>>
     **`<<h name>>`**<<if item.type>>`: <<type item>>`<</if>>
   <</if>>
   <<for sig item.signatures?.slice(1) || []>>
     \␤<<h " ".repeat(depth + 3)>><<if sig.type == "constructor">>`new `<</if>>**`<<h name>>`**`<<fntype sig>>`
   <</for>>
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