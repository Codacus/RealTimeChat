var mongo = require("mongodb").MongoClient,
    client = require("socket.io").listen(8080).sockets;
//console.log(client);

mongo.connect("mongodb://127.0.0.1/chat", function(err, db){
  if(err) throw err;
  client.on("connection", function(socket){

    var col = db.collection("messages");

    console.log("Someone has connected.");
    //Wait for input
    socket.on("input", function(data){
      var name = data.name,
          message = data.message,
          whiteSpacePattern = /^\s*$/;

          if(whiteSpacePattern.test(name) || whiteSpacePattern.test(message)){
            console.log("Invalid");
          } else {
            //insert into db
            col.insert({name:name, message:message}, function(){
              console.log("Inserted...");
            });

          }



    });
  });
});
