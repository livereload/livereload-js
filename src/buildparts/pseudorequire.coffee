###
This is fake implementation of 'exports' and 'require'
The classes composing livereload seem to be wired up for CJS loader
The original author's buld automation approach to rewiring that all 
into one .js file seems to be
regex-based replace export+require calls with quasi-private vars.
I am too lazy for that. Easier for keep code as is and fake built-in
require garbage
###

module = {}
module.exports = exports = {}

require = (file) ->
	map = {}
	returnvalue = {}
	for own key of exports
		# we are relying on exported ClassName.toLowerCase() === filename
		# as long as that's true, this works.
		map[key.toLowerCase()] = key
		map[key] = key
	if map[file]
		returnvalue[ map[file] ] = exports[map[file]]
	return returnvalue