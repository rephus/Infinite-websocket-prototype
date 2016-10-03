var ws, connectionId;
var user, sector;

function connect() {
   if ("WebSocket" in window) {
      log("Opening websocket!");
      ws = new WebSocket("ws://localhost:8001/");

      ws.onopen = function(){
         //ws.send("ping");
         log("Connection opened !!");

         setInterval(function(){
           sendJson({
             type: 'update',
             user: user
           });
         }, 100);
      };

      ws.onmessage = function (evt){
        console.log("Message received: " + evt.data);
        try {
           var json = JSON.parse(evt.data);
           switch(json.type) {
             case "connection":
                var savedConnectionId = localStorage.getItem("connectionId");
                if (savedConnectionId) {
                  log("Found existing connection Id "+savedConnectionId);

                  sendJson({
                    type: 'renew', connectionId: savedConnectionId
                  });
                }
                log("New connection Id "+json.id);
                localStorage.setItem('connectionId',json.id);

                break;
              case 'load':
                user = json.user;
                sector = json.sector;
                break;
             case 'update':
                 //user = json.user;
                 sector = json.sector;
                 break;
             default: log("Message not recognized " + evt.data);
           }
         } catch (e){
           log("Unable to parse evt  "+evt.data+ ": "+ e);
         }
      };

      ws.onclose = function() {
         log("Connection is closed.");

         setTimeout(function(){
           connect();
         }, 1000);
      };
   } else log("WebSocket NOT supported by your Browser!");
}


function log(text){
  console.log(text);
  $("#log").append(text+"\n");
}
function sendJson(json){
  json.connection = connectionId;
  //console.log("Sending",json);
  ws.send(JSON.stringify(json));
}

$("#send").click(function(){
  var input = $("#input").val();
  if (input) {
    log("Sending message: "+input);
    ws.send(input);
  }
});

connect();
