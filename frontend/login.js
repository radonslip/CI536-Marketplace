window.onload = function() {
// Check for error message in query parameters
const urlParams = new URLSearchParams(window.location.search);
const errorMessage = urlParams.get('error');
if (errorMessage) {
    document.querySelector('#error-message').textContent = errorMessage;
}};