var express = require('express')
  , app = express()
  , routes = require('./routes')
  , action = require('./routes/action')
  , score = require('./routes/score')
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , path = require('path');

var rchat = require("./server/rchat");


var dbinterface = require("./server/db");
dbinterface.open(function() {
	server.listen(3000);
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});



app.get('/', routes.index);
app.get('/chat', routes.chat);

/*
 * action
 */
app.get('/actions', action.list);
app.post('/action/create', action.create);


/*
 * score
 */
app.post('/scores', score.request_score);
app.get('/scores', score.ranking);

app.get('/scores', score.list);
app.post('/score/create', score.create);
app.get('/score/create', score.create_view);
app.get('/score/update', score.update_view);
app.post('/score/update', score.update);

app.post('/a/create_group', rchat.create_group);



io.configure(function () {
	io.set('log level', 1);
	//io.set('transports', ['websocket'/*, 'flashsocket', 'xhr-polling'*/]);
});

var chat = io.sockets.on('connection', function (socket) {
    //クライアント側からのイベントを受け取る。
    socket.on('join', function (msg) {
    	socket.join("g" + msg.group_id);
    });
    
    socket.on('message', function (msg) {
    	var room_name = "g" + msg.group_id;
        //socket.emit('result', msg);
    	chat.in(room_name).emit("msg_broadcast", msg)
        //socket.broadcast.emit('msg_broadcast', msg);
    });
    
    socket.on('disconnect', function() {
    	//socket.leave("g" + msg.group_id);
        console.log('disconnected');
    });
});
