/**
 * Function to broadcast a ping emit, this allow client to know the online/offline state
 * @param socket.io io An socket.io instance
 */
module.exports.ping = function(io){
		var l = require('winston');
		
    io.of("/ping").on("connection", function(socket){
        /* ***************************
        EVENT FROM socket.io
        *****************************/
        socket.on("connect", function(){
            l.log('info', "ping : user connect");
        });
        socket.on("disconnect", function(){
            l.log('info', "ping : user disconnect");
        });
    });
};
