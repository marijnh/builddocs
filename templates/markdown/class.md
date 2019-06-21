<<in {item, name}>>

### <<h item.type>> <<h name>>
   <<if item.typeParams>>`< <<for elt item.typeParams>><<if $i>>, <</if>><<type elt>><</for>> >`<</if>>
   <<if item.extends>> extends <<type item.extends>><</if>>␤␤

<<if item.description>><<h item.description>>␤␤<</if>>

<<if Object.prototype.hasOwnProperty.call(item, "constructor")>>
  <<define {item: item.constructor, name: name}>>
<</if>>
<<if item.properties>>
  <<for name, prop in item.properties>><<define {item: prop, name: name}>><</for>>
<</if>>
<<if item.staticProperties>>
  <<for name, prop in item.staticProperties>><<define {item: prop, name: name, static: true}>><</for>>
<</if>>
