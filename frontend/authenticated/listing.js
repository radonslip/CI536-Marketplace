let id = 1;

fetch("/listing/" + id,{method:"POST",mode:"cors", headers:{'Content-Type': 'application/json'}, body: JSON.stringify({listingID:id})})
.then(res=> res.json())
.then(data => {
      if (data.status == 'success') {
        //when data is returned from backend
      //   const response = data.title
      //   console.log(response) //should print dataReceived

      document.getElementById("lisTitle").innerText = data.title;
      document.getElementById("desc").innerText = data.desc;
      document.getElementById("price").innerText = "£" + data.price;

      console.log(data.numOImg);

      for (let img = 0; img < data.numOImg; img++) 
      {
        console.log("Image:" + img)
        // image = document.body.createElement("div")
        // image.innerText = "Test"

        const image = document.createElement("img");
        image.src = "/listing/" + id + "/" + img;
        document.body.appendChild(image);
      }

    }

    // forloop
    // crate new image
    // set source from request
  })