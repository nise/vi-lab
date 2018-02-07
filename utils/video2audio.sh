#!/bin/bash

# example: ffmpeg -i video.flv -ab 160k -ac 2 -ar 44100 -vn audio.wav

sourcepath="."
targetpath="."
options="-y -c:v libx264 -tune stillimage -c:a aac -strict experimental -b:a 192k -shortest"

file_type="mp4"
target="wav"

# extracts audio track from video files
for file in ${sourcepath}/*.${file_type}
do
		echo ".. extract audio from: "${file}
		out=${file%\.*}"."${target}
		ffmpeg -i $file -ab 256k -ac 2 -ar 44100 -vn $out
		echo "finished: "${out}	
done
