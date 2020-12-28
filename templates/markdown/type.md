<<do
  $in = processType($in)
  var undocumentedProps = null
  if ($in.properties) for (var n in $in.properties) {
    var p = $in.properties[n]
    if (!hasDescription(p)) (undocumentedProps || (undocumentedProps = [])).push([n, p])
  }
>>

<<if $in.optional>>?<</if>>
<<if $in.type == "Function">>
  fn<<fntype $in.signatures[0]>>
<<elif $in.type == "Array">>
  <<typeParens $in.typeArgs[0]>>[]
<<elif $in.type == "ReadonlyArray">>
  readonly <<typeParens $in.typeArgs[0]>>[]
<<elif $in.type == "tuple">>
  [<<for elt $in.typeArgs || []>><<if $i>>, <</if>><<type elt>><</for>>]
<<elif $in.type == "union">>
  <<for elt $in.typeArgs>><<if $i>> | <</if>><<type elt>><</for>>
<<elif $in.type == "intersection">>
  <<for elt $in.typeArgs>><<if $i>> & <</if>><<type elt>><</for>>
<<elif $in.type == "indexed">>
  <<for elt $in.typeArgs>><<if $i>>[<</if>><<type elt>><<if $i>>]<</if>><</for>>
<<elif $in.type == "conditional">>
  <<type $in.typeArgs[0]>> extends <<type $in.typeArgs[1]>> ? <<type $in.typeArgs[2]>> : <<type $in.typeArgs[3]>>
<<elif $in.type == "mapped">>
  {[<<t $in.key.name>> in <<type $in.key.implements[0]>>]: <<type $in.typeArgs[0]>>}
<<elif $in.type == "keyof">>
  keyof <<typeParens $in.typeArgs[0]>>
<<elif $in.type == "typeof">>
  typeof <<typeParens $in.typeArgs[0]>>
<<elif undocumentedProps || $in.signatures>>
  {<<if $in.signatures>>
     <<if $in.signatures[0].type == "constructor">>new <</if>><<fntype $in.signatures[0]>>
     <<if undocumentedProps>>, <</if>>
   <</if>>
   <<for prop undocumentedProps || []>>
     <<t prop[0]>><<if prop[1].optional>>?<</if>>: <<type prop[1]>>
     <<if $i < undocumentedProps.length - 1>>, <</if>>
  <</for>>}
<<else>>
  <<h $in.type>><<typeparams $in>>
<</if>>
