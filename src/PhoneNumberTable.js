class PhoneNumberTable {

    constructor(phoneNumbers = []) {

        this._columns = [{ name: 'Number', key: 'number' }, { name: 'Description', key: 'description' }];
        this._storage = phoneNumbers;
        this._container = createContainer();
        this._table = createTable();

        this._container.appendChild(this._table);

        phoneNumbers.forEach(phoneNumber => this.addPhoneNumber(phoneNumber));
    }

    get phoneNumbers() {
        return this._storage;
    }

    get container() {
        return this._container;
    }

    get table() {
        return this._table;
    }

    createContainer() {
        const div = document.createElement('div');
        div.classList.add('phone-number-table-container');
        return div;
    }

    createForm() {

        const form = document.createElement('form');
        form.classList.add('row');

        const numberInputColumn = this.createInputFieldColumn(5);
        const numberInput = document.createElement('input');
        numberInputColumn.appendChild(inputInput);

        const descriptionInputColumn = this.createInputFieldColumn(5);
        const descriptionInput = document.createElement('input');
        descriptionInputColumn.appendChild(descriptionInput);

        const buttonColumn = this.createInputFieldColumn(2);
        const button = document.createElement('document');
        buttonColumn.appendChild(button);

        form.appendChild(numberInputColumn);
        form.appendChild(descriptionInputColumn);
        form.appendChild(buttonColumn);

        return form;
    }

    createInputFieldColumn(col) {
        const div = document.createElement('div');

        div.classList.add('col');
        div.classList.add('s' + col);

        return;
    }

    createTable() {

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        table.classList.add('phone-number-table');
        table.appendChild(thead);
        table.appendChild(tbody);

        this.createTableHeaders(thead);

        return table;
    }

    createTableHeaders(thead) {
        const tr = document.createElement('tr');

        this._columns.forEach(column => {
            const th = document.createElement('th');
            th.innerText = column.name;
            tr.appendChild(th);
        });

        thead.appendChild(tr);
    }

    appendTo(element) {
        element.appendChild(this._container);
    }

    clear() {
        this._table.innerHTML = '';
        this._storage = [];
    }

    addPhoneNumber(number, description) {
        this._storage.push({ number, description });
        this.appendRow({ number, description });
    }

    appendPhoneNumber(phoneNumber) {
        const tr = document.createElement('tr');
        this._columns.forEach(column => {
            const td = document.createElement('td');
            td.innerText = phoneNumber[column.key];
            tr.appendChild(td);
        });
    }
}

export default PhoneNumberTable;