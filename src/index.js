const baseUrl = "http://localhost:8080/ca-2-backend/api/";
const tabs = M.Tabs.getInstance(document.getElementById('tabs'));
const personsColumns = [
    { name: "ID", key: "id", class: "persons-id" },
    { name: "First name", key: "firstName", class: "persons-firstName" },
    { name: "Last name", key: "lastName", class: "persons-lastName" },
    { name: "Email", key: "email", class: "persons-email" },
    {
        name: "Delete",
        element: row => {
            const button = document.createElement('button');
            button.innerText = 'Delete';
            button.classList.add('btn');
            button.addEventListener('click', e => {
                deletePerson(row['id'], (status, body) => {
                    if(status != 200){
                        error("Could not delete person.");
                        return;
                    }

                    viewPersonsTable(true);
                });
            });

            return button;
        }
    },
    {
        name: "Edit",
        element: row => {
            const button = document.createElement('button');
            button.innerText = 'Edit';
            button.classList.add('btn');
            button.addEventListener('click', e => {
                viewEditPerson(row);
            });

            return button;
        }
    }
];

function deletePerson(personId, callback) {
    const url = baseUrl + "persons/" + personId;
    fetch(url, {
        method: 'delete',
    })
        .then(response => {
            status = response.status;
            return response.json();
        })
        .then(body => callback(status, body));
}

const personsTable = createTable("person-table", personsColumns, document.getElementById("persons"));

function view(page) {
    tabs.select(page);
}

function viewEditPerson(row) {
    document.getElementById('tab-update').classList.remove('disabled');
    document.getElementById('update-person-firstName').value = row['firstName'];
    document.getElementById('update-person-lastName').value = row['lastName'];
    document.getElementById('update-person-email').value = row['email'];
    document.getElementById('update-person-address-street').value = row['address']['street'];
    document.getElementById('update-person-address-information').value = row['address']['information'];
    [].slice(document.getElementById('update-person-address-city').children).forEach(option => {
        if(option.value == row['address']['city']['id'])
            option.addAttribute('selected', 'selected');
    });

    const updatePhonesTable = document.getElementById('update-person-phones');
    const body = updatePhonesTable.children[1];
    body.innerHTML = '';
    row['phones'].forEach(phone => {
        const tr = document.createElement('tr');
        const tdNumber = document.createElement('td');
        tdNumber.innerText = phone['number'];
        const tdDescription = document.createElement('td');
        tdDescription.innerText = phone['description'];
        tr.appendChild(tdNumber);
        tr.appendChild(tdDescription);
        body.appendChild(tr);
    });

    M.updateTextFields();
    view('update');
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
        if (column['class'] != undefined)
            th.classList.add(column['class']);
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
    tbody.innerHTML = '';
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

    const selects = [document.getElementById("create-person-address-city"), document.getElementById('update-person-address-city')];

    selects.forEach(select => {
        body.forEach(row => {
            const option = document.createElement("option");
            option.value = row['id'];
            option.innerText = row['zipCode'] + ' ' + row['name'];
            select.appendChild(option);
        });

        M.FormSelect.init(select);
    });
})

const addPhoneButton = document.getElementById('create-person-phone-add');
const phoneNumbersTable = document.getElementById('create-person-phones');
let phoneNumbersTableInit = false;
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

    if (!phoneNumbersTableInit) {
        phoneNumbersTable.children[1].innerHTML = '';
        phoneNumbersTableInit = true;
    }

    const tr = document.createElement('tr');
    const tdNumber = document.createElement('td');
    tdNumber.innerText = number;
    const tdDescription = document.createElement('td');
    tdDescription.innerText = description;
    tr.appendChild(tdNumber);
    tr.appendChild(tdDescription);
    phoneNumbersTable.children[1].appendChild(tr);
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
        if (column['key'] != undefined)
            td.innerText = person[column['key']];
        else if (column['element'] != undefined)
            td.appendChild(column['element'](person));
        if (column['class'] != undefined)
            td.classList.add(column['class']);
        tr.appendChild(td);
    });

    tbody.appendChild(tr);
}