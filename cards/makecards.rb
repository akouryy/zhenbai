# download 'Uni2Pinyin' from http://kanji.zinbun.kyoto-u.ac.jp/~yasuoka/CJK.html
# Pinyin table for Unicode

Table = File.read("Uni2Pinyin").lines.grep_v(/^#/).map do |l|
  c, *q = l.split
  [c.to_i(16).chr(Encoding::UTF_8), q]
end.to_h

#raise "ARGV[0] should end with .txt" unless ARGV[0] =~ /^(.*)\.txt$/
#inf = ARGV.pop
#outf = "#$1.csv"
inf = ARGV.shift
outf = ARGV.shift

words = File.read(inf).lines

words.map! do |w|
  next w if w =~ /,/
  w.chomp!
  "['%s', '%s'],\n" % [
    w,
    w.chars.map do |c|
      t = Table[c]
      if !t or t.empty?
        if %w(〜 ～).include? c
          c
        else
          raise "unknown character: '#{c}'"
        end
      elsif t.size == 1
        t[0]
      else
        puts "select pinyin of '#{c}' in \"#{w}\""
        loop do
          puts t.map.with_index{|q,i| "(#{i+1}) #{q}" }.join ?\s*3
          i = gets.to_i
          if 1 <= i && i <= t.size
            break t[i-1]
          end
        end
      end.gsub('u:', 'v').gsub('5', '0')
    end.join
  ]
end

File.write outf, "window.words = [\n" + words.join + '];'
