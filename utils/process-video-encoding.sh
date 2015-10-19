#!/bin/bash

#todo: add conversion to webm

tmpfile="0_tmp.mp4"
options="-vcodec libx264 -b 384k -flags +loop+mv4 -cmp 256 -partitions +parti4x4+parti8x8+partp4x4+partp8x8+partb8x8 -me_method hex -subq 7 -trellis 1 -refs 5 -bf 3 -flags2 +bpyramid+wpred+mixed_refs+dct8x8 -coder 1 -me_range 16 -g 250 -keyint_min 25 -sc_threshold 40 -i_qfactor 0.71 -qmin 6 -qmax 51 -qdiff 4"

#1280x768

options="-vcodec libx264 -b 384k"
options="-codec:v libx264 -preset fast -b:v 300k -movflags +faststart -bufsize 1000k -threads 0 -codec:a libfdk_aac -b:a 256k"

# croping : -vf "crop=640:256:0:36"

# Encoding guid: https://trac.ffmpeg.org/wiki/Encode/H.264
# schneller start im Webbrowser: -movflags +faststart 
# Kompatibilität zu älteren Geräten und Android: -profile:v baseline -level 3.0
# Empfohlenes Preset: -preset veryslow


# ffmpeg -i MasterMOOC1.avi -codec:v libx264 -preset slow -b:v 500k   -bufsize 1000k -threads 0 -codec:a libfdk_aac -b:a 128k output_file.mp4

file_type="flv"

target="mp4"


# iterate files
for file in ../public/vi-lab/videos/t/*.${file_type}
do
	# mp4/h264
	#if [ "${target}" == "mp4" ]
	#then
		echo ".. encode: "${file}
		out=${file%\.*}".mp4"
		ffmpeg -i $file $options $out
		#/usr/bin/ffmpeg -y -i $file -an -pass 1 -threads 2 $options $tmpfile
		#/usr/bin/ffmpeg -y -i $file -acodec libmp3lame -ar 44100 -ab 128k -pass 2 -threads 2 $options $tmpfile 
		# libfaac
		#qt-faststart $tmpfile ${out} 
	  echo "finished: "${out}
	
	#fi
	
done
























 exit
 
 
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "1 argument required, $# provided"
echo $1 | grep -E -q '^[a-z]*$' || die "Numeric argument required, $1 provided"


	

	if [ "${1}" == "" ]
	then
		echo "Error missing file type should be encoded"
	else
		file_type=$1  
	fi


# determine target codec from argument 2
targets=("ogv" "webm" "mp4");
target_exists=`echo ${targets[*]} | grep "$2"`
if [ "$target_exists" != "" ]
then
	target=$2
else
	echo "Warning: no target codec specified, default selected: mp4"
	target="mp4"	
fi

