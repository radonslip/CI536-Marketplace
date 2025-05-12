// Get the user id from the URL
let loc = window.location.href;
let id = loc[loc.length-1]
// retreive user info
fetch("/user/" + id,{method:"POST",mode:"cors", headers:{'Content-Type': 'application/json'}, body: JSON.stringify({userID:id})})
.then(res=> res.json())
.then(data => {
    // Check if the data was succesfully received
    if (data.status == 'success') 
    {
        const container = document.querySelector(".containerOne");

        let profileImage = document.createElement("img");
        //profileImage.src = data.profileImage;
        profileImage.src = "/authenticated/Images/profilepicture.jpg";
        profileImage.alt = "Profile Image";
        container.appendChild(profileImage);

        let displayName = document.createElement("h1");
        displayName.id = "h1";
        displayName.textContent = data.display_name;
        container.appendChild(displayName);

        let location = document.createElement("h2");
        location.id = "h2";
        location.textContent = "Location: " + data.location;
        container.appendChild(location);

        console.log("Created Profile");

        for (let listing = 0; listing < data.listings.length; listing++) 
        {
            listingCreate(data.listings[listing]);
        }

    }
});

function listingCreate(data)
{
    // Create the listing and add it to the profile page
    const listing = document.createElement("li");
    listingLink = document.createElement("a");
    listingLink.href = "../listing/" + data.listing_id;
    listing.appendChild(listingLink);

    title = document.createElement("h3");
    title.textContent = data.listing_title;
    listingLink.appendChild(title);

    image = document.createElement("img");
    image.src = "/listing/" + data.listing_id + "/" + 0;
    image.className = "listingImage";
    listingLink.appendChild(image);

    price = document.createElement("p");
    price.textContent = data.listing_price;
    listingLink.appendChild(price);

    document.querySelector(".containerTwo").appendChild(listing);
    console.log("Created Listing");
}