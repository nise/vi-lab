#!/bin/bash
# author: niels.seidel@nise81.com
# description: extracts audio from video and combines a audio file with a still image.
# usage: 
#		audio extraction:   $sh process-video-audio.sh extract
#		audio still image combination:   $sh process-video-audio.sh x
## Workflow
# 1) Open .wav in audacity
# 2) effects > normalise


mode="$1"


sourcepath="/home/abb/Documents/www2/theresienstadt-explained/public/etutor/static/videos"
targetpath="/home/abb/Documents/www2/theresienstadt-explained/public/etutor/static/videos"
options="-y -c:v libx264 -tune stillimage -c:a aac -strict experimental -b:a 192k -shortest"

file_type="webm"

target="wav"

if [ $mode -le "extract" ] ; then
	# extracts audio track from video files
		#ffmpeg -i video.flv -ab 160k -ac 2 -ar 44100 -vn audio.wav
	for file in ${sourcepath}/*.${file_type}
	do
			echo ".. extract audio from: "${file}
			out=${file%\.*}"."${target}
			ffmpeg -i $file -ab 256k -ac 2 -ar 44100 -vn $out
			echo "finished: "${out}	
	done
  	
else
  # converts audio back into video
		#ffmpeg -i image8.jpg -i sound11.amr -acodec copy test.avi
	for file in ${sourcepath}/*.${target}
	do
			echo "# combine audio with image to a video: "${file}
			out=${file%\.*}"_improved.mp4"
			ffmpeg -loop 1 -i ${sourcepath}/placeholder.jpg -i ${file} ${options} $out
			echo "... finished: "${out}	
	done
fi





 
