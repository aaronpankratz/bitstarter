var fs = require('fs');
var express = require('./node_modules/express');
var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
    var fileBuf = new Buffer(fs.readFileSync('index.html'));
    response.send(fileBuf.toString());
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
