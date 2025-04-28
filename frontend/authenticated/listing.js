// Get the listing id from the URL
let loc = window.location.href;
let id = loc[loc.length-1]

// // Request the listing data to update the listing page with, this will be returned in json format
// // Fetch request from JS - https://stackoverflow.com/questions/74844272/is-there-a-way-to-send-data-from-a-js-file-to-the-express-server-without-using-a
// fetch("/listing/" + id,{method:"POST",mode:"cors", headers:{'Content-Type': 'application/json'}, body: JSON.stringify({listingID:id})})
// .then(res=> res.json())
// .then(data => {
//       // Check if the data was succesfully received
//       if (data.status == 'success') 
//       {

//         // Update the text elements of the page
//       document.querySelector("#lisTitle").innerText = data.title;
//       document.querySelector("#desc").innerText = data.desc;
//       document.querySelector("#price").innerText = "£" + data.price;

//       // Create the images for the listing
//       for (let img = 0; img < data.numOImg; img++) 
//       {
//         const image = document.createElement("img");
//         image.src = "/listing/" + id + "/" + img;
//         document.querySelector("#images").appendChild(image);
//       }

//     }
// })

document.addEventListener("DOMContentLoaded", function() { 
// Request the listing data to update the listing page with, this will be returned in json format
// Fetch request from JS - https://stackoverflow.com/questions/74844272/is-there-a-way-to-send-data-from-a-js-file-to-the-express-server-without-using-a
fetch("/listing/" + id,{method:"POST",mode:"cors", headers:{'Content-Type': 'application/json'}, body: JSON.stringify({listingID:id})})
.then(res=> res.json())
.then(data => {
      // Check if the data was succesfully received
      if (data.status == 'success') 
      {

        // Update the text elements of the page
      document.querySelector("#lisTitle").innerText = data.title;
      document.querySelector("#descr").innerText = data.desc;
      document.querySelector("#price").innerText = "£" + data.price;

      // Create the images for the listing
      for (let img = 0; img < data.numOImg; img++) 
      {
        const image = document.createElement("img");
        image.src = "/listing/" + id + "/" + img;
        document.querySelector("#images").appendChild(image);
      }

    }
})

});