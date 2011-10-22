require 'rake/clean'

DIST = 'dist/livereload.js'
COFFEE = FileList['src/*.coffee']
JS = []

VERSION_FILES = %w(
    src/connector.coffee
)

def coffee dst, src
    sh 'coffee', '-c', '-b', '-o', File.dirname(dst), src
end

COFFEE.each do |coffee|
    JS << (js = File.join('lib', File.basename(coffee).ext('js')))

    file js => [coffee] do
        coffee js, coffee
    end
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

def version
    File.read('VERSION').strip
end

def subst_version_refs_in_file file, ver
    puts file
    orig = File.read(file)
    prev_line = ""
    anything_matched = false
    data = orig.lines.map do |line|
        if line =~ /\d\.\d\.\d/ && (line =~ /version/i || prev_line =~ /CFBundleShortVersionString|CFBundleVersion/)
            anything_matched = true
            new_line = line.gsub /\d\.\d\.\d/, ver
            puts "    #{new_line.strip}"
        else
            new_line = line
        end
        prev_line = line
        new_line
    end.join('')

    raise "Error: no substitutions made in #{file}" unless anything_matched

    File.open(file, 'w') { |f| f.write data }
end

file DIST => JS do
    puts "CONCAT #{DIST}"
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

desc "Embed version number where it belongs"
task :version do
    ver = version
    VERSION_FILES.each { |file| subst_version_refs_in_file(file, ver) }
    Rake::Task[:build].invoke
end

desc "Increase version number"
task :bump do
    prev = version
    components = File.read('VERSION').strip.split('.')
    components[-1] = (components[-1].to_i + 1).to_s
    File.open('VERSION', 'w') { |f| f.write "#{components.join('.')}\n" }
    puts "#{prev} => #{version}"
    Rake::Task[:version].invoke
end

desc "Tag the current version"
task :tag do
    sh 'git', 'tag', "v#{version}"
end
desc "Move (git tag -f) the tag for the current version"
task :retag do
    sh 'git', 'tag', '-f', "v#{version}"
end

task :default => :build

CLOBBER << DIST
CLEAN.include *JS
