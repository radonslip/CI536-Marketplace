document.querySelector("#imgInp").onchange = evt => 
{
    const [file] = imgInp.files
    if (file) {
        document.querySelector("#imgPrev").src = URL.createObjectURL(file)
    }
}