class PhoneNumberTable {

    constructor(phoneNumbers = [], editable) {

        this._editable = editable;
        this._columns = [{ name: 'Number', key: 'number' }, { name: 'Description', key: 'description' }];
        this._storage = phoneNumbers;
        this._container = this.createContainer();
        this._table = this.createTable();
        this._thead = this._table.children[0];
        this._tbody = this._table.children[1];

        if (this._editable)
            this.createInsertRow();

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

    createInsertRow() {

        const row = document.createElement('tr');

        const numberInputTd = document.createElement('td');
        const numberInput = document.createElement('input');
        numberInputTd.appendChild(numberInput);
        numberInput.setAttribute('placeholder', 'Number');

        const descriptionInputTd = document.createElement('td');
        const descriptionInput = document.createElement('input');
        descriptionInputTd.appendChild(descriptionInput);
        descriptionInput.setAttribute('placeholder', 'Description');

        const insertButtonTd = document.createElement('td');
        insertButtonTd.style.width = '100px';
        const insertButton = document.createElement('button');
        insertButton.innerText = 'Add';
        insertButton.style.display = 'block';
        insertButton.style.width = '100px';
        insertButton.classList.add('btn');
        insertButtonTd.appendChild(insertButton);

        insertButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.addPhoneNumber({number: numberInput.value, description: descriptionInput.value});
            numberInput.value = '';
            descriptionInput.value = '';
        });

        row.appendChild(numberInputTd);
        row.appendChild(descriptionInputTd);
        row.appendChild(insertButtonTd);

        this._tbody.appendChild(row);
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

        if (this._editable) {
            const th = document.createElement('th');
            th.innerText = '';
            tr.appendChild(th);
        }

        thead.appendChild(tr);
    }

    appendTo(element) {
        element.appendChild(this._container);
    }

    clear() {
        
        if(this._editable){
            const insertTr = this._tbody.lastChild;
            this._tbody.innerHTML = '';
            this._tbody.appendChild(insertTr);
        }

        this._storage = [];
    }

    addPhoneNumbers(phoneNumbers){
        phoneNumbers.forEach(phoneNumber => this.addPhoneNumber(phoneNumber));
    }

    addPhoneNumber(phoneNumber) {
        this._storage.push(phoneNumber);
        this.appendPhoneNumber(phoneNumber);
    }

    appendPhoneNumber(phoneNumber) {
        const tr = document.createElement('tr');
        this._columns.forEach(column => {
            const td = document.createElement('td');
            td.innerText = phoneNumber[column.key];
            tr.appendChild(td);
        });

        if (this._editable) {
            const td = document.createElement('td');
            const removeButton = document.createElement('button');
            td.style.width = '100px';
            removeButton.innerText = 'Remove';
            removeButton.style.display = 'block';
            removeButton.style.width = '100px';
            removeButton.classList.add('btn');
            removeButton.addEventListener('click', (e) => {
                e.preventDefault();
                tr.parentElement.removeChild(tr);
                this._storage.delete(phoneNumber);
            });

            td.appendChild(removeButton);
            tr.appendChild(td);
        }

        if (this._editable)
            this._tbody.insertBefore(tr, this._tbody.lastChild);
        else
            this._tbody.appendChild(tr);
    }
}

export default PhoneNumberTable;