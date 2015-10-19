
/*
* Preprocess video files
**/


exec('~/./play.sh /media/external/' + req.params.movie,
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});
