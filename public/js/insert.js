'use strict';

(function() {

    let idField;
    let nameField;
    let colorField;
    let priceField;
    let stockField;
    let resultarea;

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        resultarea = document.getElementById('resultarea');
        idField = document.getElementById('id');
        nameField = document.getElementById('name');
        colorField = document.getElementById('color');
        priceField = document.getElementById('price');
        stockField = document.getElementById('stock');

        document.getElementById('submit').addEventListener('click', send);

        idField.addEventListener('focus', clear);
    }

    function clear() {
        idField.value = '';
        nameField.value = '';
        colorField.value = '';
        priceField.value = '';
        stockField.value = '';
        resultarea.textContent = '';
        resultarea.removeAttribute('class');
    }

    async function send() {
        const flower = {
            id: +idField.value,
            name: nameField.value,
            color: colorField.value,
            price: +priceField.value,
            stock: +stockField.value
        };

        try {
            const options = {
                method: 'POST',
                body: JSON.stringify(flower),
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors'
            };
            const response = await fetch('http://localhost:4000/api/flowers', options);
            const result = await response.json();

            updateStatus(result);
        } catch (err) {
            updateStatus({ message: err.message, type: 'error' });
        }
    } // end of send

    function updateStatus(status) {
        resultarea.textContent = status.message;
        resultarea.setAttribute('class', status.type);
    }

})();
