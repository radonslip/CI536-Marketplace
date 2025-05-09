// How many listings should be displayed on the home page
let num = 15;
console.log("Home Page JS Loaded");

// Load the default home page
defaultListing();

// Assign Search Event Listener
document.querySelector("#submit").addEventListener("click", searchListing);
document.querySelector("#search").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.querySelector("#submit").click(); //trigger submit button click when enter is pressed
    }
});

// Clear all currently displayed listings
function clearHome()
{
    console.log("Clear");
    document.querySelector("#listingsList").replaceChildren();
}

// Create a listing from the servers response
function listingCreate(data)
{
    console.log(data);

    // Create the listing and add it to the home page
    const listing = document.createElement("li");
    listingLink = document.createElement("a");
    listingLink.href = "listing/" + data.listing_id;
    listing.appendChild(listingLink);

    title = document.createElement("h3");
    title.innerText = data.listing_title;
    listingLink.appendChild(title);

    image = document.createElement("img");
    image.src = "/listing/" + data.listing_id + "/" + 0;
    listingLink.appendChild(image);

    price = document.createElement("p");
    price.innerText = data.listing_price;
    listingLink.appendChild(price);

    document.querySelector("#listingsList").appendChild(listing);
    console.log("Created Listing");
}

// Search Function for the home page
function defaultListing()
{
    // Clear the page of existing data
    clearHome();
    console.log(document.querySelector("#search").value);
    
    // retreive listing info
    fetch("/home",{method:"POST",mode:"cors", headers:{'Content-Type': 'application/json'}, body: JSON.stringify({numOfListings:num})})
    .then(res=> res.json())
    .then(data => {
        console.log(data[0])
        // listingCreate(data, id)

        // Create the listings on the home page
        for (let listing = 0; listing < data.length; listing++) 
        {
            listingCreate(data[listing]);
        }
    })
}

// Search Function for the home page
function searchListing()
{
    clearHome();

    // retreive search query
    let search = document.querySelector("#search").value;

    fetch("/home",{method:"POST",mode:"cors", headers:{'Content-Type': 'application/json'}, body: JSON.stringify({numOfListings:num, searchQuery:search})})
    .then(res=> res.json())
    .then(data => {
        console.log(data[0])
        // listingCreate(data, id)

        // Create the listings on the home page
        for (let listing = 0; listing < data.length; listing++) 
        {
            listingCreate(data[listing]);
        }
    })
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