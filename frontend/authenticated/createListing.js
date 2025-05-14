document.querySelector("#imgInp").onchange = evt => 
{
    const [file] = imgInp.files
    if (file) {
        document.querySelector("#imgPrev").src = URL.createObjectURL(file)
    }
}

document.querySelector("#submitForm").addEventListener("click", function(event) {
    event.preventDefault();

    const form = document.querySelector("#listingForm");
    const formData = new FormData(form);

    fetch("/create/listing", {
        method: "POST",
        body: formData,
    })
    .then(res => res.json())
    .then(data => {
        if (data.status == 'success') {
            console.log("listing created");
            window.location.href = "/home";
        }
    })
    .catch(err => console.error("Error:", err));
});

//link to user profile
fetch("/session/user")
    .then((res) => res.json())
    .then((data) => {
        if (data.user_id) {
            document.querySelector("#userProfile").action = `/user/${data.user_id}`;
        } else {
            console.error("Failed to fetch user ID");
        }
    })
    .catch((err) => console.error("Error fetching user session:", err));