'use strict';

(function() {
    let idField;
    let nameField;
    let colorField;
    let priceField;
    let stockField;
    let resultarea;
    let searchState = true;

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        idField = document.getElementById('id');
        nameField = document.getElementById('name');
        colorField = document.getElementById('color');
        priceField = document.getElementById('price');
        stockField = document.getElementById('stock');
        resultarea = document.getElementById('resultarea');

        updateFieldsAccess();

        document.getElementById('submit').addEventListener('click', send);
        document.getElementById('clear').addEventListener('click', reset);
        idField.addEventListener('focus', clearAll);
    } // end of init

    function reset() {
        searchState = true;
        clearAll();
    }

    function clearAll() {
        if (searchState) {
            idField.value = '';
            nameField.value = '';
            colorField.value = '';
            priceField.value = '';
            stockField.value = '';
            resultarea.textContent = '';
            resultarea.removeAttribute('class');
            updateFieldsAccess();
        }
    } // end of clearAll

    function updateFieldsAccess() {
        if (searchState) {
            idField.removeAttribute('readonly');
            nameField.setAttribute('readonly', true);
            colorField.setAttribute('readonly', true);
            priceField.setAttribute('readonly', true);
            stockField.setAttribute('readonly', true);
        } else {
            idField.setAttribute('readonly', true);
            nameField.removeAttribute('readonly');
            colorField.removeAttribute('readonly');
            priceField.removeAttribute('readonly');
            stockField.removeAttribute('readonly');
        }
    } // end of updateFieldsAccess

    async function send() {
        const baseUri = 'http://localhost:4000/api/flowers';
        try {
            if (searchState) {
                // Get data
                const data = await fetch(`${baseUri}/id/${idField.value}`, { mode: 'cors' });
                const result = await data.json();

                if (result.length > 0) {
                    const flower = result[0];
                    idField.value = flower.id;
                    nameField.value = flower.name;
                    colorField.value = flower.color;
                    priceField.value = flower.price;
                    stockField.value = flower.stock;
                    searchState = false;
                    updateFieldsAccess();
                } else {
                    updateStatus({ message: 'Nothing found', type: 'error' });
                }
            } else {
                // Put data
                const flower = {
                    id: +idField.value,
                    name: nameField.value,
                    color: colorField.value,
                    price: +priceField.value,
                    stock: +stockField.value
                };
                const options = {
                    method: 'PUT',
                    mode: 'cors',
                    body: JSON.stringify(flower),
                    headers: { 'Content-Type': 'application/json' }
                };

                const data = await fetch(`${baseUri}/${flower.id}`, options);
                const result = await data.json();

                updateStatus(result);
                searchState = true;
                updateFieldsAccess();
            }
        } catch (error) {
            updateStatus({ message: error.message, type: 'error' });
        }
    } // end of send

    function updateStatus(status) {
        resultarea.textContent = status.message;
        resultarea.setAttribute('class', status.type);
    }

})();
