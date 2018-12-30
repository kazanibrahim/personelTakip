var connectWs = function connectWs(){
  
  var socket = new WebSocket("ws://"+allConfig.ws.url+":"+allConfig.ws.port);

  socket.onopen = function () {
    console.log("Connected!");
  };

  socket.onclose = function (e) {
    /*
    setTimeout(function(){
      console.log("reconnecting...");
      connectWs();
    }, 5000);*/
  };

  socket.onmessage = function (e) {

    var table = document.getElementById("dataTable");


    var data = JSON.parse(e.data);
    
    var row = table.insertRow(1);

    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);

    if(data.err && data.message === 'READER NOT EXIST ON DATABASE!' ){
      cell1.innerHTML = data.reader.serial;
      cell2.innerHTML = "Kayıtsız Okuyucu";
    }
    setTimeout(function(){
      console.log("Closed!");
      socket.close();
    }, 2000);
  };
};

connectWs();
