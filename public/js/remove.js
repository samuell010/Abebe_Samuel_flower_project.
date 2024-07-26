'use strict';

(function () {
    let resultarea;
    let inputField;

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        resultarea = document.getElementById('resultarea');
        inputField = document.getElementById('flowerId');

        document.getElementById('submit').addEventListener('click', send);
        inputField.addEventListener('focus', clear);
    }

    function clear() {
        inputField.value = '';
        resultarea.textContent = '';
        resultarea.removeAttribute('class');
    }

    function updateStatus(status) {
        resultarea.textContent = status.message;
        resultarea.setAttribute('class', status.type);
    }

    async function send() {
        const value = inputField.value;
        if (value <= 0) {
            updateStatus({ message: 'Invalid ID', type: 'error' });
        } else {
            try {
                const options = {
                    method: 'DELETE',
                    mode: 'cors'
                };

                const response = await fetch(`http://localhost:4000/api/flowers/${value}`, options);
                const result = await response.json();
                updateStatus(result);
            } catch (err) {
                updateStatus({ message: err.message, type: 'error' });
            }
        }
    }

})();
