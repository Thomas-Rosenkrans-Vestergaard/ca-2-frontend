class HtmlTable {

    constructor(id, columns) {
        this._id = id;
        this._columns = columns;
        this._tableContainer = this.createContainer();
        this._tableElement = this.createTable(id, columns);
        this._tableContainer.appendChild(this._tableElement);
        this._tableHead = this._tableElement.children[0];
        this._tableBody = this._tableElement.children[1];
        this._spinning = false;
        this._currentSpinner = undefined;
    }

    set noResultsMessage(message) {
        this._noResultsMessage = { html: false, message };
    }

    set noResultMessageHTML(message) {
        this._noResultsMessage = { html: true, message };
    }

    get tableElement() {
        return this._tableElement;
    }

    get tableContainer() {
        return this._tableContainer;
    }

    createContainer() {
        const div = document.createElement('div');

        return div;
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
        if (this._noResultsMessage != null)
            if (this._noResultsMessage.html)
                this.appendHtmlMessage(this._noResultsMessage.message);
            else
                this.appendMessage(this._noResultsMessage.message);
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

    appendMessage(message) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.innerText = message;
        td.colSpan = this._columns.length;
        tr.appendChild(td);
        this._tableBody.appendChild(tr);
    }

    appendHtmlMessage() {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.innerHTML = message;
        td.colSpan = this._columns.length;
        tr.appendChild(td);
        this._tableBody.appendChild(tr);
    }

    startSpinner(minBodyHeight = 200, loaderWidth = 64, loaderHeight = 64) {
        if (!this._spinning) {
            this._tableContainer.style['min-height'] = minBodyHeight + this._tableHead.getBoundingClientRect().height + 'px';
            const bounding = this._tableContainer.getBoundingClientRect();
            this._currentSpinner = document.createElement('img');
            this._currentSpinner.src = 'loader.gif';
            this._currentSpinner.style.top =  this._tableHead.getBoundingClientRect().height + bounding.top + (bounding.height - loaderHeight) / 2 + 'px';
            this._currentSpinner.style.left = bounding.left + (bounding.width - loaderWidth) / 2 + 'px';
            this._currentSpinner.style.position = 'absolute';
            this._currentSpinner.height = loaderHeight;
            this._currentSpinner.width = loaderWidth;
            this._tableElement.parentElement.appendChild(this._currentSpinner);
            this._spinning = true;
        }
    }

    stopSpinner() {
        if (this._spinning) {
            this._currentSpinner.parentElement.removeChild(this._currentSpinner);
            this._currentSpinner = undefined;
            this._spinning = false;
        }
    }
}

export default HtmlTable;