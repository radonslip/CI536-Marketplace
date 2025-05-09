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
    .then(res => console.log(res))
    .then(data => console.log("Success:", data))
    .catch(err => console.error("Error:", err));
})