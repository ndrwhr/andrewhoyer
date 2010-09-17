require 'rubygems'
require 'sqlite3'

class String
  
  def escape
    self.gsub(/[\n\r]/,'\\\\n').gsub(/'/, "\\\\'")
  end
  
  def json
    "'#{self.escape}'"
  end
  
end

class Fixnum
  def json
    "#{self}"
  end
end

class Array
  def json
    "[#{self.map{|s| s.json}.join(',')}]"
  end
end

class Something
  
  def initialize(id, date, type, tags, body)
    @id = id
    @date = Time.parse(date).to_i
    @type = type
    @tags = tags.split(', ')
    @body = body.gsub('<br/>','\n').gsub(/\n+/,'\n')
    if !@body.eql? body
      puts id
    end
  end
  
  def json
    line = "'#{@id}':{"
    line += "'date':#{@date * 1000},"
    line += "'type':#{@type.json},"
    line += "'tags':#{@tags.json},"
    line += "'body':#{@body.json}"
    line += "}"
  end
  
  def id
    @id
  end
  
  def tags
    @tags
  end
  
  def type
    @type
  end
end

class Somethings
  def initialize()
    @somethings = []
  end
  
  def add(something)
    @somethings.push(something)
  end
  
  def array
    @somethings.collect{ |something| something.id }.json
  end
  
  def map
    @somethings.collect{ |something| something.json }.join(", ")
  end
  
  def json
    line = "{"
    line += "'ids':#{self.array},"
    line += "'map':{#{self.map}}"
    line += "}"
  end
end

class Tag
  
  def initialize(tag, id)
    @tag = tag
    @ids = [id]
  end
  
  def add(id)
    @ids.push(id)
  end
  
  def json
    "#{@tag.json}:#{@ids.json}"
  end
  
end

class TagCloud
  
  def initialize
    @tags = {}
  end
  
  def add(something)
    
    something.tags.each do |tag|
      tag.downcase!
      if @tags[tag]
        @tags[tag].add(something.id)
      else
        @tags[tag] = Tag.new(tag, something.id)
      end
    end
    
  end
  
  def array
    @tags.keys.json
  end
  
  def map
    @tags.values.collect{ |tag| tag.json }.join(",")
  end
  
  def json
    line = "{"
    line += "'ids':#{self.array},"
    line += "'map':{#{self.map}}"
    line += "}"
  end
  
end

class Type
  
  def initialize(type, id)
    @type = type
    @ids = [id]
  end
  
  def add(id)
    @ids.push(id)
  end
  
  def json
    "#{@type.json}:#{@ids.json}"
  end
  
end

class Types
  
  def initialize
    @types = {}
  end
  
  def add(something)
    type = something.type.downcase!
    if @types[type]
      @types[type].add(something.id)
    else
      @types[type] = Type.new(type, something.id)
    end
  end
  
  def array
    @types.keys.json
  end
  
  def map
    @types.values.collect{ |type| type.json }.join(",")
  end
  
  def json
    line = "{"
    line += "'ids':#{self.array},"
    line += "'map':{#{self.map}}"
    line += "}"
  end
  
end


db = SQLite3::Database.new( "somethings.db" )
db.results_as_hash = true

output = File.new('somethings.js','w')

tag_cloud = TagCloud.new
types = Types.new
somethings = Somethings.new
something = nil
i = 0
db.execute( "select * from somethings order by created_at asc" ) do |row|
  something = Something.new(row['id'], row['created_at'], row['type_of'], row['cached_tag_list'], row['body'])
  somethings.add something
  tag_cloud.add something
  types.add something
  i += 1
end

output.puts "var SomethingADay = {"

output.puts "\t'somethings': #{somethings.json},"
output.puts "\t'tags': #{tag_cloud.json},"
output.puts "\t'types': #{types.json},"

output.puts "};"
