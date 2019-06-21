<<if $in.item.type == "class" || $in.item.type == "interface">>
  <<class $in>>
<<elif $in.item.type == "type">>
  <<typealias $in>>
<<elif $in.item.type == "reexport">>
  <<reexport $in>>
<<else>>
  <<define $in>>
<</if>>
