window.onload = function() 
{
  testUser = "test@email.com"
  console.log("sending: " + testUser)
  socket = io.connect('http://localhost:80', {transports: ['websocket']});

  img = document.getElementById("image");

  socket.emit("reqImage", testUser);

  socket.on("sendImage", data =>
  {
    // img.setAttribute('src',"data:image/jpg;base64,"+ data.toString("base64"));

    var blob = new Blob([data], { type: "image/jpeg" });
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    // var img = document.querySelector("#photo");
    img.src = imageUrl;
    console.log(data)
  }
  )
};