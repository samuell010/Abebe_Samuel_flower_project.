'use strict';

function adapt(item) {
    return Object.assign(item, {
        Id: item.Id,
        name: item.name,
        unitPrice: +item.unitPrice,
        stock: +item.stock,
        farmer: item.farmer
    });
}

module.exports = { adapt };
