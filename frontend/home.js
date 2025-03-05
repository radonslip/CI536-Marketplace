window.onload = function() 
{
    console.log("loaded")

    fetch("http://localhost:4500/home", {
        method: "POST",
        body: JSON.stringify({
          username: "test@email.com",
        })
      });
      
};