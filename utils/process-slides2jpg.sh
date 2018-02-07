#!/bin/bash
# author: niels.seidel@nise81.com
# description: converts a pdf into optimized jpg images

sourcepath="/home/abb/Documents/www2/theresienstadt-explained/data/etutor/slides"
targetpath="/home/abb/Documents/www2/theresienstadt-explained/public/etutor/static/slides"
file_type="pdf"
target="mp4"
i=1;

# iterate files
for file in ${sourcepath}/*.${file_type}
do
		echo ".. converting "${file}
		# make a directory for each video
		mkdir -p ${targetpath}/video${i}
		# convert pdf to jpg
		convert -quality 100 -density 300 ${file} ${targetpath}/video${i}/e2script_${i}.jpg
		# crop
		find ${targetpath}/video${i} -type f -iname "*.jpg" -exec convert {} -crop 2120x1590+183+83 {} \;
		# scale
		find ${targetpath}/video${i} -type f -iname "*.jpg" -exec mogrify -scale 800 -quality 91 {} \;
		# optimize
		find ${targetpath}/video${i} -type f -iname "*.jpg" -exec jpegoptim {} \;
		
		echo ${file} ${targetpath}/video${i}/e2script_${i}.jpg
		
		echo "done with "${file}"........................."
		
		i=$((i+1))
done


