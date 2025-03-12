window.onload = function() {
const urlParams = new URLSearchParams(window.location.search);
const errorMessage = urlParams.get('error');
if (errorMessage) {
    document.querySelector('#error-message').textContent = errorMessage;
}};