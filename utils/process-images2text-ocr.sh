#!/bin/bash

# author: niels.seidel@nise81.com
# description: reads text of jpg-slides and stores it in a json file

directory="$(find ../slides/* -type d)"
out='{ "ocr": ['

for dir in $directory
do
	echo $dir
	id=$(echo $dir | sed 's/.\/slides\///g')
	out="$out { \"id\":\"$id\", \"slides\": [ "
	var="$(find $dir/ -type f -iname '*2.jpg')"
	stream=""
	for page in $var
	do
  	base="${page%.jpg}"
    LD_LIBRARY_PATH=/usr/local/lib /usr/local/bin/cuneiform -f text -l eng -o ./ocr.txt "$page"
   	value=`cat ./ocr.txt`
   	value=$(echo "$value" | sed s'/[0-9]//g' | tr '\n' ' ' | sed "s/[^a-z|0-9| ]//g;" | sed s'/ [a-zA-Z] / /g' | sed s'/ [a-zA-Z][a-zA-Z] / /g' | sed s'/  */\ /g' | sed s'/[a-zA-Z]!//g') 
   	image=$(echo $base | sed 's/.\/slides\///g')
    echo "$id _________ $value"
    stream="$stream { 	\"source\":\"$image.jpg\",	\"text\": \"$value\"}," 
	done
	stream=$(echo "$stream" | sed '$s/.$//')
	out="$out  $stream	]},"
done
out=$(echo "$out" | sed '$s/.$//')
out="$out ]}"	

echo "$out" > ../ocr.json
#rm ./ocr.txt



exit
















directory="$(find ./test/* -type d)"
out='{ \n "ocr": ['

for dir in $directory
do
	echo $dir
	id=$(echo $dir | sed 's/.\/test\///g')
	out="$out \n  { \"id\":\"$id\", \"slides\": [ "
	var="$(find $dir/ -type f -iname '*2.jpg')"
	stream=""
	for page in $var
	do
  	base="${page%.jpg}"
    LD_LIBRARY_PATH=/usr/local/lib /usr/local/bin/cuneiform -f text -l eng -o ./ocr.txt "$page"
   	value=`cat ./ocr.txt`
   	value=$(echo "$value" | sed s'/[0-9]//g' | tr '\n' ' ' | sed "s/[^a-z|0-9| ]//g;" | sed s'/ [a-zA-Z] / /g' | sed s'/ [a-zA-Z][a-zA-Z] / /g' | sed s'/  */\ /g' | sed s'/[a-zA-Z]!//g') 
   	image=$(echo $base | sed 's/.\/test\///g')
    echo $image
    stream="$stream \n		{ \n	 	\"source\":\"$image.jpg\", \n		\"text\": \"$value\"\n		}," 
	done
	stream=$(echo "$stream" | sed '$s/.$//')
	out="$out \n $stream	\n	]},"
done
out=$(echo "$out" | sed '$s/.$//')
out="$out \n]}"	

echo "$out" > ./ocr.json
#rm ./ocr.txt
#echo $out



