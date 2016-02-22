var mongo = require("mongodb").MongoClient,
  client = require("socket.io").listen(8080).sockets;
//console.log(client);

mongo.connect("mongodb://127.0.0.1/chat", function(err, db) {
  if (err) throw err;
  client.on("connection", function(socket) {

    var col = db.collection("messages");

    //status function
    var sendStatus = function(s) {
      socket.emit("status", s);
    };

    //Emit all messages
    col.find().limit(100).sort({_id: 1}).toArray(function(err, res){
      if(err) throw err;
      socket.emit("output",res);
    });

    console.log("Someone has connected.");
    //Wait for input
    socket.on("input", function(data) {
      var name = data.name,
        message = data.message,
        whiteSpacePattern = /^\s*$/;

      if (whiteSpacePattern.test(name) || whiteSpacePattern.test(message)) {
        sendStatus("Name/Message is required");
      } else {
        //insert into db
        col.insert({name: name, message: message}, function() {
          //emit latest msgs to all clients
          client.emit("output", [data]);
            sendStatus({message: "Message sent", clear: true});
        });

      }



    });
  });
});
