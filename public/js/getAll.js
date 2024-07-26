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
                tr.appendChild(createCell(flower.id));
                tr.appendChild(createCell(flower.name));
                tr.appendChild(createCell(flower.color));
                tr.appendChild(createCell(flower.unitprice));
                tr.appendChild(createCell(flower.stock));
                resultset.appendChild(tr);
            }
        } catch (err) {
            console.error('Error fetching flower data:', err);
        }
    } // end of init

    function createCell(data) {
        const td = document.createElement('td');
        td.textContent = data;
        return td;
    }

})();
