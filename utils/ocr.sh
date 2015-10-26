#!/bin/bash

# author: niels.seidel@nise81.com
# description: reads text of jpg-slides and stores it in a json file

directory="$(find ../public/etutor/static/slides/* -type d)"
out='{ "ocr": ['
break='\n'

for dir in $directory
do
	echo $dir
	id=$(echo $dir | sed 's/.\/slides\///g')
	out="$out { \"id\":\"$id\", \"slides\": [ "
	var="$(find $dir/ -type f -iname '*2.jpg')"
	stream=""
	for page in $var
	do
		# /usr/local/lib /usr/local/bin/
  	base="${page%.jpg}"
    cuneiform -f text -l ger -o ./ocr.txt "$page"
   	value=`cat ./ocr.txt`
   	value=$(echo "$value" | sed s'/[0-9]//g' | tr '\n' ' ' | sed "s/[^a-zA-Z|0-9| ]//g;" | sed s'/ [a-zA-Z] / /g' | sed s'/ [a-zA-Z][a-zA-Z] / /g' | sed s'/  */\ /g' | sed s'/[a-zA-Z]!//g') 
   	image=$(echo $base | sed 's/.\/slides\///g')
    echo "_________ $value"
    echo "\n"
    stream="$stream { 	\"source\":\"$image.jpg\",	\"text\": \"$value\"},$break" 
	done
	stream=$(echo "$stream" | sed '$s/.$//')
	out="$out  $stream	]},$break"
done
out=$(echo "$out" | sed '$s/.$//')
out="$out ]}"	

echo "$out" > ../ocr.json
#rm ./ocr.txt



exit

















