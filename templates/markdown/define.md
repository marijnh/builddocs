<<in {item, name, static, abstract, depth=0}>>

<<h " ".repeat(depth)>> * <<if abstract>>`abstract `<</if>><<if static>>`static `<</if>>
   <<if item.type == "Function" && !item.optional>>
     <<if item.signatures[0].type == "constructor">>`new `<</if>>**`<<h name>>`**`<<fntype item.signatures[0]>>`
   <<else>>
     **`<<h name>>`**`<<if item.optional>>?<</if>><<if item.type>>: <<type item>><</if>>`
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
  <<for params (item.signatures || []).map(s => s.params.concat(item.typeParams || [])).concat([item.typeParams || []])>>
    <<for param params>>
      <<if hasDescription(param)>>
         <<define {item: param, name: param.name, depth: depth + 3}>>
      <</if>>
    <</for>>
  <</for>>
  <<for sig (item.signatures || [])>>
    <<if sig.returns && hasDescription(sig.returns)>>
      <<define {item: sig.returns, name: "returns", depth: depth + 3}>>
    <</if>>
  <</for>>