
var ws = require("nodejs-websocket");

global.redis = require('redis').createClient(6379, 'redis');

var SECTOR_SIZE = 100;

var clients = {};
var sectors = {
  "0,0": { id: "0,0", users:[], origin: [0, 0]}
};

var server = ws.createServer(function (conn) {

  var connectionId = conn.key;

    console.log("New connection: " +connectionId);
    sendJson(conn, {type: 'connection', id: connectionId});

    clients[connectionId] = {
      id: connectionId,
      created: new Date().getTime(),
      connection: conn,
      user: {
        position: [50,50]
      },
      status: 'connected'
    };

    loadClient(clients[connectionId]);

    conn.on("text", function (str) {
        //console.log("Received from "+connectionId+ ": "+str);

        try {
          var json = JSON.parse(str);
          processJson(conn, json);
        } catch(e){
          console.error("Unable to parse json "+ str);
        }
    });

    conn.on("close", function (code, reason) {
        console.log("Connection closed ", connectionId);

        //delete clients[connectionId];
        clients[connectionId].status = 'disconnected';
        //clearInterval(interval);
    });

}).listen(8001);

var positionToSector = function(position){
  return [
    parseInt(position[0] / SECTOR_SIZE),
    parseInt(position[1] / SECTOR_SIZE)
  ];

};
//32145

var loadClient = function(client) {
  var user = client.user;
  var sectorPos = positionToSector(client.user.position);
  var sector = getOrCreateSector(sectorPos);
  sendJson(client.connection, {type: 'load', user: client.user, sector: sector});

};
var getOrCreateSector = function(pos) {
  var index = pos[0] +","+pos[1];
  if (sectors[index]) {
     return sectors[index];
  } else {
     return createSector(pos);
  }
};

var createSector = function(pos){
  // TODO sector to index method
  var index = pos[0] +","+ pos[1];
  sectors[index] = {
    id: index,
    origin: [pos[0] * SECTOR_SIZE, pos[1] * SECTOR_SIZE],
    users:[]
  };
  return sectors[index];
};

//Send messages to all connected clients at the same time every 5 seconds
var interval = setInterval(function(){
  var clientIds = Object.keys(clients);

  //console.log("Sending data to clients: "+ clientIds);
  for (var c in clientIds ){
    var client = clients[clientIds[c]];
    if (client && client.connection && client.status == "connected") {
      var conn = client.connection;
      var sectorPos = positionToSector(client.user.position);
      var sector = getOrCreateSector(sectorPos);
      sendJson(conn, {type: 'update', user: client.user, sector: sector});
    }
  }
},100);

console.log("Websocket server started");

var processJson = function(connection, json) {
  var connectionId = connection.key;
  var type = json.type;
  switch(type){
    case 'renew':
      // Copy the existing old connectionId form the user to the new connectionId
      // to be able to reuse connections (persisting user sessions)
      clients[connectionId] = {
        id: connectionId,
        created: new Date().getTime(),
        connection: connection,
        status: 'connected',
        user: clients[json.connectionId].user
      };
      sendJson(connection, {type: 'renew', id: connectionId});

      loadClient(clients[connectionId]);

      break;

   case 'update':
      clients[connectionId].user = json.user;
      break;
    default:
        console.error("Json type not recognized: "+type);
  }
};

var sendJson = function(conn, json){
  conn.sendText(JSON.stringify(json));
};
