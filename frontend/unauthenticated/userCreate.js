window.addEventListener('load', function () {
    const inputUser = document.querySelector('#username'),
    inputPwd = document.querySelector('#password'),
    form = login.querySelector('form');
    form.addEventListener('submit', async function (evt) {

        evt.preventDefault();

        const username = inputUser.value.trim();
        const pwd = inputPwd.value;

        let fieldsOK = true;

        if (fieldsOK) {
            form.submit();
        }

    });
});