'use strict';

(function() {
    let keylist;
    let searchvalue;
    let idField;
    let nameField;
    let unitPriceField;
    let stockField;
    let farmerField;
    let resultarea;
    let formFields;
    let updateButton;
    let searchState = true;

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        keylist = document.getElementById('keylist');
        searchvalue = document.getElementById('searchvalue');
        idField = document.getElementById('id');
        nameField = document.getElementById('name');
        unitPriceField = document.getElementById('unitPrice');
        stockField = document.getElementById('stock');
        farmerField = document.getElementById('farmer');
        resultarea = document.getElementById('resultarea');
        formFields = document.getElementById('formFields');
        updateButton = document.getElementById('update');

        updateFieldsAccess();

        document.getElementById('submit').addEventListener('click', send);
        document.getElementById('clear').addEventListener('click', reset);
        updateButton.addEventListener('click', update);
    } // end of init

    function reset() {
        searchState = true;
        clearAll();
    }

    function clearAll() {
        if (searchState) {
            keylist.value = 'Id';
            searchvalue.value = '';
            idField.value = '';
            nameField.value = '';
            unitPriceField.value = '';
            stockField.value = '';
            farmerField.value = '';
            resultarea.textContent = '';
            resultarea.removeAttribute('class');
            updateFieldsAccess();
            formFields.classList.add('hidden');
            updateButton.classList.add('hidden');
        }
    } // end of clearAll

    function updateFieldsAccess() {
        if (searchState) {
            searchvalue.removeAttribute('readonly');
            idField.setAttribute('readonly', true);
            nameField.setAttribute('readonly', true);
            unitPriceField.setAttribute('readonly', true);
            stockField.setAttribute('readonly', true);
            farmerField.setAttribute('readonly', true);
        } else {
            searchvalue.setAttribute('readonly', true);
            idField.setAttribute('readonly', true);
            nameField.removeAttribute('readonly');
            unitPriceField.removeAttribute('readonly');
            stockField.removeAttribute('readonly');
            farmerField.removeAttribute('readonly');
        }
    } // end of updateFieldsAccess

    async function send() {
        const baseUri = 'http://localhost:4000/api/flowers';
        try {
            if (searchState) {
                // Get data
                const keyName = keylist.value;
                const value = searchvalue.value;
                const response = await fetch(`${baseUri}/${keyName}/${encodeURIComponent(value)}`, { mode: 'cors' });
                
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }

                const result = await response.json();

                if (result.length > 0) {
                    const flower = result[0];
                    idField.value = flower.Id;
                    nameField.value = flower.name;
                    unitPriceField.value = flower.unitPrice;
                    stockField.value = flower.stock;
                    farmerField.value = flower.farmer;
                    searchState = false;
                    updateFieldsAccess();
                    formFields.classList.remove('hidden'); // Show form fields
                    updateButton.classList.remove('hidden'); // Show update button
                } else {
                    updateStatus({ message: 'Nothing found', type: 'error' });
                }
            }
        } catch (error) {
            updateStatus({ message: error.message, type: 'error' });
        }
    } // end of send

    async function update() {
        const baseUri = 'http://localhost:4000/api/flowers';
        try {
            // Validate fields
            if (!idField.value || !nameField.value || !unitPriceField.value || !stockField.value || !farmerField.value) {
                throw new Error('All fields must be filled to update');
            }

            // Prepare the flower data
            const flower = {
                Id: parseInt(idField.value, 10),  // Ensure ID is an integer
                name: nameField.value,
                unitPrice: parseFloat(unitPriceField.value),  // Ensure unitPrice is a float
                stock: parseInt(stockField.value, 10),  // Ensure stock is an integer
                farmer: farmerField.value
            };

            // Log payload for debugging
            console.log('Updating flower with payload:', flower);

            // Send PUT request
            const response = await fetch(`${baseUri}/${flower.Id}`, {
                method: 'PUT',
                mode: 'cors',
                body: JSON.stringify(flower),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with status ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            updateStatus(result);
            searchState = true;
            updateFieldsAccess();
            formFields.classList.add('hidden'); // Hide form fields again
            updateButton.classList.add('hidden'); // Hide update button again
        } catch (error) {
            updateStatus({ message: error.message, type: 'error' });
        }
    } // end of update

    function updateStatus(status) {
        resultarea.textContent = status.message;
        resultarea.setAttribute('class', status.type);
    }

})();
