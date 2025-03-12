window.addEventListener('load', function (){
    
    const inputUser = document.querySelector('#username'),
    inputPwd = document.querySelector('#pwd'),

    hideUsername = document.querySelector('#hidUsername'),
    hidePwd = document.querySelector('#hidPwd'),
    divLogin = document.querySelector('#login');

    form = login.querySelector('form');

    let fieldsOK = true;

    form.addEventListener('submit', async function(evt){

        evt.preventDefault();

        const username = inputUser.value.trim();
        const pwd = inputPwd.value;

        let fieldsOK = true;

        if (username.length == 0) {
            hidUsername.style.display = 'inline';
            fieldsOK = false;
        } else {
            hidUsername.style.display = 'none';
        }

        if (pwd.length == 0) {
            hidPwd.style.display = 'inline';
            fieldsOK = false;
        } else if (pwd.length < 8) {
            hidPwd.style.display = 'inline';
            fieldsOK = false;
        } else {
            hidPwd.style.display = 'none';
        }



    });

});