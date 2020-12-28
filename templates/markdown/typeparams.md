<<if $in.typeParams>>
  <<<for tp $in.typeParams>>
    <<if $i>>, <</if>>
    <<t tp.name>>
    <<if tp.implements>> extends<<for parent tp.implements>> <<type parent>><</for>><</if>>
    <<if tp.default>> = <<t tp.default>><</if>>
  <</for>>
<</if>>