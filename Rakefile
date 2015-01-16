VERSION_FILES = %w(
    src/connector.coffee
    bower.json
)

def version
    content = File.read('package.json')
    if content =~ /"version": "(\d+\.\d+\.\d+)"/
        return $1
    else
        raise "Failed to get version info from package.json"
    end
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

desc "Embed version number where it belongs"
task :version do
    ver = version
    VERSION_FILES.each { |file| subst_version_refs_in_file(file, ver) }
    sh 'grunt'
end

desc "Tag the current version"
task :tag do
    sh 'git', 'tag', "v#{version}"
end
desc "Move (git tag -f) the tag for the current version"
task :retag do
    sh 'git', 'tag', '-f', "v#{version}"
end
