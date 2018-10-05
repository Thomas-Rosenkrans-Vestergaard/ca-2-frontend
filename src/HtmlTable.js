class HtmlTable {

    constructor(id, columns) {
        this._id = id;
        this._columns = columns;

        /**
         * HTML elements
         */
        this._tableElement = this.createTable(id, columns);
        this._tableHead = this._tableElement.children[0];
        this._tableBody = this._tableElement.children[1];
        this._tableOuterContainer = this.createOuterContainer();
        this._tableInnerContainer = this.createInnerContainer();
        this._tableOuterContainer.appendChild(this._tableInnerContainer);
        this._tableInnerContainer.appendChild(this._tableElement);

        /**
         * Loading spinner.
         */
        this._spinning = false;
        this._spinner = undefined;

        /**
         * Pagination
         */
        this._eagerPaginationRows = undefined;
        this._currentPage = 1;
        this._paginationConfig = undefined;
        this._paginationButtonsContainer = undefined;
        this._usePaginationButtons = false;
    }

    paginate(config) {
        this._paginationConfig = config;
    }

    useEagerPagination(pageSize) {
        this._paginationConfig = { mode: 'eager', pageSize };
    }

    /**
     * Instructs the HtmlTable to use lazy loading for pagination.
     * 
     * @param pageSize The number of pages the table is configured to hold.
     * @param rowsCallback The callback that must retrieve rows for a new page.
     * @param countCallback THe callback that must retrieve the number of rows in total.
     */
    useLazyPagination(pageSize, rowsCallback, countCallback) {
        this._paginationConfig = { mode: 'lazy', pageSize, rowsCallback, countCallback };
    }

    usePaginationButtons() {
        if (this._paginationConfig == undefined) {
            throw new Error("No pagination configured.");
        }

        this._usePaginationButtons = true;
        if (this._paginationConfig['mode'] == 'lazy')
            this._paginationConfig['countCallback'](count => {
                this.createPaginationButtons(count);
            });
    }

    createPaginationButtons(count) {

        if (this._paginationButtonsContainer != undefined) {
            this._tableOuterContainer.removeChild(this._paginationButtonsContainer);
            this._paginationButtonsContainer = undefined;
        }

        const container = document.createElement('div');
        container.classList.add('html-table-pagination');
        const ul = document.createElement('ul');
        ul.classList.add('pagination');
        const numberOfPages = Math.ceil(count / this._paginationConfig.pageSize);
        let activeLi = undefined;
        for (let i = 1; i <= numberOfPages; i++) {
            const li = document.createElement('li');
            li.classList.add('waves-effect');
            const a = document.createElement('a');
            a.innerText = "" + i;
            li.appendChild(a);

            if (i == 1) {
                activeLi = li;
                li.classList.add('active');
            }

            li.addEventListener('click', e => {
                this.page(i);
                li.classList.add('active');
                activeLi.classList.remove('active');
                activeLi = li;
            });
            ul.appendChild(li);
        }

        container.appendChild(ul);
        this._tableOuterContainer.appendChild(container);
        this._paginationButtonsContainer = container;
    }

    set noResultsMessage(message) {
        this._noResultsMessage = { html: false, message };
    }

    set noResultMessageHTML(message) {
        this._noResultsMessage = { html: true, message };
    }

    get currentPage() {
        return this._currentPage;
    }

    get tableElement() {
        return this._tableElement;
    }

    get tableContainer() {
        return this._tableOuterContainer;
    }

    createOuterContainer() {
        const div = document.createElement('div');
        div.classList.add('html-table-outer-container');
        return div;
    }

    createInnerContainer() {
        const div = document.createElement('div');
        div.classList.add('html-table-inner-container');

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

    populate(rows = []) {

        if (this._paginationConfig != undefined && this._paginationConfig['mode'] == 'lazy') {
            this.page(1);
            return;
        }


        this.clear();
        if (rows.length < 1) {
            if (this._noResultsMessage != null)
                if (this._noResultsMessage.html)
                    this.appendHtmlMessage(this._noResultsMessage.message);
                else
                    this.appendMessage(this._noResultsMessage.message);
            return;
        }

        if (this._paginationConfig != undefined)
            this.populateWithPagination(rows);
        else
            this.appendRows(rows);
    }

    populateWithPagination(rows) {
        this._eagerPaginationRows = rows;
        if (this._usePaginationButtons)
            this.createPaginationButtons(rows.length);
        if (this._paginationConfig['mode'] == 'eager')
            this.appendRows(rows.slice(0, this._paginationConfig.pageSize));
    }

    /**
     * Jumps to the provided page.
     * @param Integer page The page to jump to, starts at 1.
     */
    page(page, tempHeight = undefined) {
        if (this._paginationConfig == undefined)
            throw new Error("No pagination config.");

        if (this._paginationConfig.mode == 'eager')
            this.pageWithEagerPagination(page);
        if (this._paginationConfig.mode == 'lazy')
            this.pageWithLazyPagination(page, tempHeight);
    }

    pageWithEagerPagination(page) {
        this.clear();
        const start = (page - 1) * this._paginationConfig.pageSize;
        const end = start + this._paginationConfig.pageSize;
        this.appendRows(this._eagerPaginationRows.slice(start, end));
    }

    pageWithLazyPagination(page, tempHeight = undefined) {
        this.startSpinner();
        this.translucent();
        if (tempHeight != undefined)
            this._tableInnerContainer.style.height = this.absolutePosition(this._tableHead).height + tempHeight + 'px';
        this._paginationConfig['rowsCallback'](page, this._paginationConfig.pageSize, rows => {
            this.clear();
            this.appendRows(rows);
            this.stopSpinner();
            this.opaque();
            this._tableInnerContainer.style.height = 'auto';
        });
    }

    translucent() {
        this._tableBody.style.opacity = 0.4;
    }

    opaque() {
        this._tableBody.style.opacity = 1;
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

    startSpinner(loaderWidth = 64, loaderHeight = 64) {
        if (!this._spinning) {
            const bounding = this.absolutePosition(this._tableInnerContainer);
            this._spinner = document.createElement('img');
            this._spinner.src = 'loader.gif';
            this._spinner.style.top = 20 + bounding.top + (bounding.height - loaderHeight) / 2 + 'px';
            this._spinner.style.left = 20 + bounding.left + (bounding.width - loaderWidth) / 2 + 'px';
            this._spinner.style.position = 'absolute';
            this._spinner.height = loaderHeight;
            this._spinner.width = loaderWidth;
            this._tableOuterContainer.appendChild(this._spinner);
            this._spinning = true;
        }
    }

    stopSpinner() {
        if (this._spinning) {
            this._spinner.parentElement.removeChild(this._spinner);
            this._spinner = undefined;
            this._spinning = false;
        }
    }

    absolutePosition(element) {
        const bodyRect = document.body.getBoundingClientRect();
        const elemRect = element.getBoundingClientRect();

        return {
            height: elemRect.height,
            width: elemRect.width,
            left: elemRect.left,
            right: elemRect.right,
            top: elemRect.top - bodyRect.top,
            bottom: elemRect.bottom - bodyRect.bottom
        }
    }
}

export default HtmlTable;