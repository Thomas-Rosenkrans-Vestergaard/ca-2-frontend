class HtmlTable {

    constructor(id, columns) {
        this._id = id;
        this._columns = columns;
        this._tableElement = this.createTable(id, columns);
        this._tableHead = this._tableElement.children[0];
        this._tableBody = this._tableElement.children[1];
    }

    get tableElement() {
        return this._tableElement;
    }

    createTable(id, columns) {
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        table.id = id;
        table.appendChild(thead);
        table.appendChild(tbody);

        this.createTableHeaders(thead, id, columns);

        return table;
    }

    createTableHeaders(thead, id, columns) {
        const tr = document.createElement('tr');
        columns.forEach(column => {
            const th = document.createElement('th');
            th.innerText = column['name'];
            if (column['class'] != undefined)
                th.classList.add(column['class']);
            tr.appendChild(th);
        });
        thead.appendChild(tr);
    }

    clear() {
        this._tableBody.innerHTML = '';
    }

    populate(rows) {
        this.clear();
        this.appendRows(rows);
    }

    appendRows(rows) {
        rows.forEach(row => {
            this.appendRow(row);
        });
    }

    appendRow(row) {
        const tr = document.createElement('tr');

        this._columns.forEach(column => {
            const td = document.createElement('td');
            if (column['key'] != undefined)
                td.innerText = row[column['key']];
            else if (column['element'] != undefined)
                td.appendChild(column['element'](row));
            if (column['class'] != undefined)
                td.classList.add(column['class']);
            tr.appendChild(td);
        });

        this._tableBody.appendChild(tr);
    }
}

export default HtmlTable;