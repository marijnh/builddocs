<<do
  var undocumentedProps = false
  if ($in.properties) for (var n in $in.properties) if (!hasDescription($in.properties[n])) undocumentedProps = true
>>
<<if $in.optional>>?<</if>>
<<if $in.type == "Function">>
  fn<<fntype $in>>
<<elif $in.type == "Array">>
  <<if $in.typeParams.length == 1>>
    <<type $in.typeParams[0]>>[]
  <<else>>
    [<<for elt $in.typeParams || []>><<if $i>>, <</if>><<type elt>><</for>>]
  <</if>>
<<elif $in.type == "union">>
  <<for elt $in.typeParams>><<if $i>> | <</if>><<type elt>><</for>>
<<elif $in.type == "intersection">>
  <<for elt $in.typeParams>><<if $i>> & <</if>><<type elt>><</for>>
<<elif undocumentedProps>>
  <<do var needComma = false>>
  {<<for name, prop in $in.properties>>
    <<if !hasDescription(prop)>><<if needComma>>, <</if>><<h name>>: <<type prop>><<do needComma = true>><</if>>
   <</for>>}
<<else>>
  <<h $in.type>>
  <<if $in.typeParams>>< <<for elt $in.typeParams>><<if $i>>, <</if>><<type elt>><</for>> ><</if>>
<</if>>
