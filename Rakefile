require 'rake/clean'

DIST = 'dist/livereload.js'
COFFEE = FileList['src/*.coffee']
JS = []

COFFEE.each do |coffee|
    JS << (js = File.join('lib', File.basename(coffee).ext('js')))
end

class JSModule

    attr_reader :name, :varname, :src
    attr_accessor :deps

    def initialize file
        @file = file
        @deps = []
        @name = File.basename(file, '.js')
        @varname = "__#{@name}"
        @visited = false

        @src = File.read(@file).gsub /require\('([^']+)'\)/ do |match|
            depname = $1
            @deps << depname
            "__#{depname}"
        end.gsub(/\bmodule\.exports\b/, @varname).gsub(/\bexports\b/, @varname)
    end

    def visit ordered
        return if @visited
        @visited = true

        @deps.each { |mod| mod.visit(ordered) }

        ordered << self
    end
end

file DIST => JS do

    modules = {}
    JS.each do |js|
        mod = JSModule.new(js)
        modules[mod.name] = mod
    end

    modules.values.each do |mod|
        mod.deps = mod.deps.map { |dep| modules[dep] or raise "Module #{mod.name} depends on #{dep}, which does not exist" }
    end

    ordered = []
    modules.values.each { |mod| mod.visit ordered }

    code = []
    code << "(function() {\n"
    code << "var " + ordered.map { |mod| "#{mod.varname} = {}" }.join(", ") + ";\n"

    ordered.each { |mod| code << "\n// #{mod.name}\n#{mod.src.strip}\n" }

    code << "})();\n"

    src = code.join("")
    File.open(DIST, 'w') { |f| f.write src }
end

desc "Build livereload.js"
task :build => DIST

task :default => :build

CLOBBER << DIST
