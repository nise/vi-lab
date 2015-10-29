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
    # remove unwanted characters
   	value=`cat ./ocr.txt`
   	value=$(echo "$value" | sed s'/[0-9]//g')  # replace digits
   	value=$(echo "$value" | tr '\n' ' ') # remove linebreaks
   	value=$(echo "$value" | sed "s/[^a-zA-Z|0-9| ]//g;") 
#   	value=$(echo "$value" | sed s'/ [a-zA-Z] / /g')
#   	value=$(echo "$value" | sed s'/ [a-zA-Z][a-zA-Z] / /g')
   	value=$(echo "$value" | sed s'/  */\ /g') # remove multiple blancs
   	value=$(echo "$value" | sed s'/[a-zA-Z]!//g') # remove special characters
   	 
   	image=$(echo $base | sed 's/.\/slides\///g')
    #echo "$id _________ $value"
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

















