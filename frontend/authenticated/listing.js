// Get the listing id from the URL
let loc = window.location.href;
var parts = loc.split('/');
var lastSegment = parts.pop() || parts.pop();  // handle potential trailing slash
let id = lastSegment;


// Request the listing data to create the page
// Fetch request from JS - https://stackoverflow.com/questions/74844272/is-there-a-way-to-send-data-from-a-js-file-to-the-express-server-without-using-a
fetch("/listing/" + id,{method:"POST",mode:"cors", headers:{'Content-Type': 'application/json'}, body: JSON.stringify({listingID:id})})
.then(res=> res.json())
.then(data => {
  listingCreate(data)
})

// create the listing page using data from the server
function listingCreate(data)
{
  // A div to hold the entire listing
  const listing = document.createElement("div");

  // Create the title and add it to the listing div
  title = document.createElement("h1");
  title.innerText = data.title;
  listing.appendChild(title);

  // Create a holder for the listings images
  images = document.createElement("div")
  images.id = "images"

  // Add the images to the holder
  for (let img = 0; img < data.numOImg; img++) 
  {
    const image = document.createElement("img");
    image.src = "/listing/" + id + "/" + img;
    images.appendChild(image)
  }

  // add the holder to the listing
  listing.appendChild(images);

  // Add the listing description
  descHeader = document.createElement("h2");
  descHeader.innerText = "Description:";
  listing.appendChild(descHeader);

  desc = document.createElement("p");
  desc.innerText = data.desc;
  listing.appendChild(desc);

  
  // Add the listing price
  priceHeader = document.createElement("h2");
  priceHeader.innerText = "Price:";
  listing.appendChild(priceHeader);

  price = document.createElement("h3");
  price.innerText = "£" + data.price;
  listing.appendChild(price);

  user = document.createElement("a");
  user.textContent = "Seller: " + data.user;
  user.href = "/user/" + data.user_id;
  listing.appendChild(user);

  // add the listing itself to the main object
  document.querySelector("main").appendChild(listing);
}

//link to user profile
fetch("/session/user")
    .then((res) => res.json())
    .then((data) => {
        if (data.user_id) {
            document.querySelector("#userProfile").href = `/user/${data.user_id}`;
        } else {
            console.error("Failed to fetch user ID");
        }
    })
    .catch((err) => console.error("Error fetching user session:", err));