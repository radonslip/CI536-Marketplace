// How many listings should be displayed on the home page
let num = 2;

// Create the listings on the home page
for (let id = 1; id < num+1; id++) 
{
    // retreive listing info
    fetch("/home",{method:"POST",mode:"cors", headers:{'Content-Type': 'application/json'}, body: JSON.stringify({listingID:id})})
    .then(res=> res.json())
    .then(data => {
        // Check if the data was succesfully received
        if (data.status == 'success') 
        {
            // Create the listing and add it to the home page
            const listing = document.createElement("div");
            listingLink = document.createElement("a");
            listingLink.href = "listing/" + id;
            listing.appendChild(listingLink);

            title = document.createElement("h3");
            title.innerText = data.title;
            listingLink.appendChild(title);

            image = document.createElement("img");
            image.src = "/listing/" + id + "/" + 0;
            listingLink.appendChild(image);

            price = document.createElement("p");
            price.innerText = data.price;
            listingLink.appendChild(price);

            document.getElementById("listingsList").appendChild(listing);
        }
    })
}