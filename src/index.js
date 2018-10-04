const baseUrl = "http://localhost:8080/ca-2-backend/api/";
const tabs = M.Tabs.getInstance(document.getElementById('tabs'));
const personsColumns = [
    column("ID", "id"),
    column("First name", "firstName"),
    column("Last name", "lastName"),
    column("Email", "email"),
];
const personsTable = createTable("person-table", personsColumns, document.getElementById("persons"));

function column(name, key) {
    return { name: name, key: key };
}

function createTable(id, columns, parent) {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    table.id = id;
    table.appendChild(thead);
    table.appendChild(tbody);

    createTableHeaders(thead, id, columns);

    parent.appendChild(table);

    return table;
}

function createTableHeaders(thead, id, columns) {
    const tr = document.createElement('tr');
    columns.forEach(column => {
        const th = document.createElement('th');
        th.innerText = column['name'];
        th.classList.add(id + '-' + column['key']);
        tr.appendChild(th);
    });
    thead.appendChild(tr);
}

function getFetch(url, cb) {
    let status = -1;
    fetch(url)
        .then(response => {
            status = response.status;
            return response.json();
        })
        .then(body => cb(status, body));
}

function getPersons(cb) {
    const url = baseUrl + "persons";
    getFetch(url, cb);
}

function getCities(cb) {
    const url = baseUrl + "cities";
    getFetch(url, cb);
}

function populatePersons(data) {

    const tbody = personsTable.lastChild;

    data.forEach(row => {
        appendPerson(tbody, row);
    });
}

function error(message) {
    M.toast({ 'html': message });
}

function viewPersonsTable(refresh) {
    if (refresh)
        getPersons((status, body) => {
            if (status != 200) {
                error("Could not retrieve persons table.");
                return;
            }

            populatePersons(body);
        });

    tabs.select('persons');
}

viewPersonsTable(true);
getCities((status, body) => {
    if (status != 200) {
        error("Could not retrieve cities.");
        return;
    }

    const select = document.getElementById("create-person-address-city");
    body.forEach(row => {
        const option = document.createElement("option");
        option.value = row['id'];
        option.innerText = row['zipCode'] + ' ' + row['name'];
        select.appendChild(option);
    });

    M.FormSelect.init(select);
})

const addPhoneButton = document.getElementById('create-person-phone-add');
const phoneNumbersList = document.getElementById('create-person-phones');
let phoneNumbersListInit = false;
let phoneNumbers = [];
addPhoneButton.addEventListener('click', e => {
    e.preventDefault();

    const numberInput = document.getElementById('create-person-phone-number');
    const number = numberInput.value;
    const descriptionInput = document.getElementById('create-person-phone-description');
    const description = descriptionInput.value;

    let errors = false;

    if (number == undefined || number.length < 1 || number.length > 255) {
        error("Invalid phone number.");
        errors = true;
    }

    if (description == undefined || description.length < 1 || description.length > 255) {
        error("Invalid phone description.");
        errors = true;
    }

    if (errors)
        return;

    if (!phoneNumbersListInit) {
        phoneNumbersList.innerHTML = '';
        phoneNumbersListInit = true;
    }

    const li = document.createElement('li');
    li.innerText = number + ', ' + description;
    phoneNumbersList.appendChild(li);
    phoneNumbers.push({ number: number, description: description });

    numberInput.value = '';
    descriptionInput.value = '';
});

const createPersonSubmit = document.getElementById('create-person-submit');
createPersonSubmit.addEventListener('click', e => {

    const submit = {
        firstName: document.getElementById('create-person-firstName').value,
        lastName: document.getElementById('create-person-lastName').value,
        email: document.getElementById('create-person-email').value,
        address: {
            street: document.getElementById('create-person-address-street').value,
            information: document.getElementById('create-person-address-information').value,
            city: document.getElementById('create-person-address-city').value,
        },
        phones: phoneNumbers
    };

    createPerson(submit, (status, body) => {
        if (status != 201) {
            error("Could not create person.");
            error(body.message);
            return;
        }

        appendPerson(personsTable.lastChild, body);
        viewPersonsTable(false);
    });
});

function createPerson(submit, callback) {
    const url = baseUrl + "persons";
    let status = -1;
    fetch(url, {
        method: 'post',
        body: JSON.stringify(submit),
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    })
        .then(response => {
            status = response.status;
            return response.json();
        })
        .then(body => callback(status, body));
}

function appendPerson(tbody, person) {
    const tr = document.createElement('tr');
    personsColumns.forEach(column => {
        const td = document.createElement('td');
        td.innerText = person[column['key']];
        td.classList.add(personsTable.id + '-' + column['key']);
        tr.appendChild(td);
    });

    tbody.appendChild(tr);
}