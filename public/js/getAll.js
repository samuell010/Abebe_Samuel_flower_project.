'use strict';

(function() {

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        try {
            // Fetch flower data from the specified endpoint
            const data = await fetch('http://localhost:4000/api/flowers', { mode: 'cors' });
            const result = await data.json();

            // Get the table body element where the flower data will be displayed
            const resultset = document.getElementById('resultset');

            // Iterate over each flower and create a table row
            for (const flower of result) {
                const tr = document.createElement('tr');
                tr.appendChild(createCell(flower.Id)); // Fixed property name
                tr.appendChild(createCell(flower.name)); // Fixed property name
                tr.appendChild(createCell(flower.unitPrice)); // Fixed property name
                tr.appendChild(createCell(flower.stock)); // Fixed property name
                tr.appendChild(createCell(flower.farmer)); // Added farmer property
                resultset.appendChild(tr);
            }
        } catch (err) {
            console.error('Error fetching flower data:', err);
        }
    } // end of init

    function createCell(data) {
        const td = document.createElement('td');
        td.textContent = data !== undefined ? data : 'N/A'; // Handle missing data
        return td;
    }

})();
