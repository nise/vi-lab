var mongoose = require('mongoose')

mongoose.connect("mongodb://localhost/nodechat");

var messageSchema = mongoose.Schema({
    nickname: String,
    message: String,
    date: String
})

var Message = mongoose.model('messages', messageSchema);

exports.message = Message;