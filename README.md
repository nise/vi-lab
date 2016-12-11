

# Vi-Lab
Vi-Lab is a state of the art video labratory and learning environment. It enables instructors to structure online courses by groups, time contraints, available features and resource access. Student groups can collaborate in problem solving tasks and augmenting the video content.


## Installation

**Install on server**

1. Obtain code: `git clone https://github.com/nise/vi-lab`
2. Install dependencies: `sudo npm update`
3. Run the server: `node server`
4. Login: `http://<your-server>:3033/login`
 - user: bob
 - password: secret

**Update from this repository**

1. `git fetch --all && git reset --hard origin/master`

## Use Cases
* Flipped Classroom: Structure online learning a flipped/inverted classroom 
* MOOC: Define a MOOC-like course where learner are joining groups
* Self-regulated learning:
* Advanced scripted collaboration: Video Jigsaw, Video Peer Assessment, Video Peer Reflection

## Features

**Principle features**
* enables group collaboration regarding video-related tasks
* annotate videos in realtime 
* structure collaborative learning by defining access and widgets for collaborative task

**Videos Annotations**
* spatio temporal highlighting of areas inside the video
* simultaneous media presentations, e.g. images, video, slides
* spatio temporal hyperlinks (including cyclic links)
* let users annotate comments, chapter marks, tags or any other type of annotation.

**Group Communication**
* time-based user comments
* sending message to groups and users

**Video Assessment and Analysis**
* Self Assessment: integrate multiple choice and free form tasks into temporal structure of the video
* Make use of advanced assessment types like fill-in and on-demand taks
* Peer Assessment: Let users annotate question dedicated for their peers in the same or any other group
* Regions inside the video can be selected, labeled, categorzed or described

**Accessibility**
* search inside the video considering annotated contents and extracted data
* quick access content by a table of content
* adjustable playback speed
* zoom in to catch visual details in the moving image
* play loops of a selected time range
* provide subtitles in different languages
* use a transcript as an alternative representation of the audiovisual media

## comming soon
* video analytics dash board
* let users take time-related notes while watching the video
* extract spatio-temporal fragments from the video
* play multi-angle videos
 
 
## License
MIT

 
 
 

