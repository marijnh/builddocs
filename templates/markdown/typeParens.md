<<do
  var need = $in.type == "union" || $in.type == "intersection" || $in.type == "conditional" || $in.type == "Function"
>>

<<t need ? "(" : "">><<type $in>><<t need ? ")" : "">>
