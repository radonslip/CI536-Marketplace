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
            const listing = document.createElement("a");
            listing.innerText = data.title;
            listing.href = "listing/" + id;
            document.body.appendChild(listing);
        }
    })
}