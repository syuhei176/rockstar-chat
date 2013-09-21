var express = require('express')
  , app = express()
  , routes = require('./routes')
  , action = require('./routes/action')
  , score = require('./routes/score')
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , path = require('path');

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



io.configure(function () {
	io.set('log level', 1);
	//io.set('transports', ['websocket'/*, 'flashsocket', 'xhr-polling'*/]);
});

var chat = io.sockets.on('connection', function (socket) {
    //クライアント側からのイベントを受け取る。
    chat.to
    //socket.join()
    
    socket.on('msg send', function (msg) {
        //イベントを実行した方に実行する
        socket.emit('msg push', msg);
        //イベントを実行した方以外に実行する
        socket.broadcast.emit('msg push', msg);
    });
    //接続が解除された時に実行する
    socket.on('disconnect', function() {
        console.log('disconnected');
    });
});
