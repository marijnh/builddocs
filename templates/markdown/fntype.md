<<typeparams $in>>
(<<for param $in.params || []>>
  <<if $i>>, <</if>><<if param.rest>>...<</if>>
  <<if param.name>><<h param.name>><<if param.optional>>?<</if>>: <</if>>
  <<type param>>
  <<if param.default>> = <<h param.default>><</if>>
 <</for>>)
<<if $in.returns>> → <<type $in.returns>><</if>>
