window.addEventListener('load', function () {

    const inputUser = document.querySelector('#username'),
    inputPwd = document.querySelector('#userPwd'),
    reEnterPwd = document.querySelector('#confirmPwd'),

    hideAnswer = document.querySelector('#hidAnswer'),
    hideLetter = document.querySelector('#pwdLength'),
    hideCapital = document.querySelector('#capital'),
    hideNumber = document.querySelector('#number'),
    hideChar = document.querySelector('#specChar'),

    createUser = document.querySelector('#userCreate');

    form = document.querySelector('form');

//function to check if the user's password meets all the requirements
    function passwordValid(){
        let fieldsOK = true;

        const username = inputUser.value.trim;
        const userPwd = inputPwd.value;
        const confirmPwd = reEnterPwd.value;

        //checks the passwords match

        if(userPwd != confirmPwd){
            fieldsOK = false;
        }

        //hides the password does not match, if there is nothing in password

        if(userPwd.length == 0){
            hideAnswer.style.display = 'none';
        }

        //checks for a number
        if(userPwd.match(/[0-9]/)){
            hideNumber.style.display = 'none';
        } else{
            hideNumber.style.display = 'block';
            fieldsOK = false;
        }

        //checks the password is less than 8 characters
        if(userPwd.length < 8){
            pwdLength.style.display = 'block';
            fieldsOK = false;
        } else {
            pwdLength.style.display = 'none';
        }

        //checks for a capital letter
        if(userPwd.match(/[A-Z]/)){
            capital.style.display = 'none';
        } else {
            capital.style.display = 'block';
            fieldsOK = false;
        }


        if(userPwd.match(/[^A-Za-z0-9]/)) {
            hideChar.style.display = 'none';
        } else {
            hideChar.style.display = 'block';
            fieldsOK = false;
        }
        
        return fieldsOK;
    };


    inputPwd.addEventListener('keyup', function() {
        //calls the passwordValid function
        passwordValid();
        //as the user types a password it should show them
        //what they need in a password
    });

    form.addEventListener('submit', async function(evt){
        evt.preventDefault();

        const username = inputUser.value.trim;
        const userPwd = inputPwd.value;
        const confirmPwd = reEnterPwd.value;

        //shows if the passwords don't match
        if(userPwd == confirmPwd){
            hideAnswer.style.display = 'none';
        } else {
            hideAnswer.style.display = 'block';
        }
    });


    form.addEventListener('submit', async function (evt) {

        evt.preventDefault();

        
        const userPwd = inputPwd.value;
        const confirmPwd = reEnterPwd.value;


        if(passwordValid()){
            console.log("this worked");
            form.submit();
        } else{
            console.log("try again");
        }

    });

    this.document.querySelector("#login").addEventListener("click", function () {
        window.location.href = "/";
    });

})