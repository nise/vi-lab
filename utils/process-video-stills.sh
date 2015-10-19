#!/bin/bash
# author: niels.seidel@nise81.com
# description: extracts still images from a video file

sourcepath="/home/abb/Documents/www2/theresienstadt-explained/public/terezin/static/videos"
targetpath="/home/abb/Documents/www2/theresienstadt-explained/public/terezin/static/img/video-stills"

videofile="theresienstadt"
videoextension="mp4"

# make directory for storing the images
mkdir -p ${targetpath}/${videofile}

# extract key frames
## fps=1    = 1 second
## fps=1/60    = 1 minute
## fps=1/600    = 10 minutes
ffmpeg -nostats -loglevel 1 -i ${sourcepath}/${videofile}.${videoextension} -vf fps=1 -y ${targetpath}/${videofile}/still-image-%d.jpg

# one precise stills
#ffmpeg -i ${sourcepath}/${videofile}.${videoextension} -ss 00:20:00 -vframes 1 -y ${targetpath}/${videofile}/still-image-%3d.png ;

# iterate stills
#for i in $(seq 50); do 
#ffmpeg -nostats -loglevel 0 -i ${sourcepath}/${videofile}.${videoextension} -ss ${i} -vframes 1 -y ${targetpath}/${videofile}/still-image-${i}.png ;
#echo $i; done


# compress thumbnails
find ${targetpath}/${videofile}/ -type f -iname "*.jpg" -exec mogrify -scale 200 -quality 91 {} \;

# optimize jpegs
find ${targetpath}/${videofile}/ -type f -iname "*.jpg" -exec jpegoptim {} \;






# echo extracted file names
ls ${targetpath}/${videofile}



# get still from remote server
#ffmpeg -ss 500 -i http://127.0.0.1:3033/static/videos/theresienstadt.mp4 -vframes 1 -vcodec png -an -y %d.png






# TESTS #

#ffmpeg -i ${sourcepath}/${videofile}.${videoextension} -r 10000 -f image2 ${targetpath}/${videofile}/still-image-%3d.jpg
## select every i-frame
#ffmpeg -i input.flv -vf "select='eq(pict_type,PICT_TYPE_I)'" -vsync vfr thumb%04d.png

