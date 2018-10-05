import HtmlTable from './HtmlTable.js';
import DataMapper from './dataMapper.js'

const baseUrl = "http://localhost:8080/ca-2-backend/api/";
const dataMapper = new DataMapper(baseUrl);
const tabs = M.Tabs.getInstance(document.getElementById('tabs'));
const personColumns = [
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
                dataMapper.deletePerson(row['id'], (status, body) => {
                    if (status != 200) {
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

const personsTable = new HtmlTable("all-persons-table", personColumns);
document.getElementById("persons-table-target").appendChild(personsTable.tableContainer);

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
        if (option.value == row['address']['city']['id'])
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

function error(message) {
    M.toast({ 'html': message });
}

function viewPersonsTable(refresh) {
    if (refresh){
        personsTable.startSpinner();
        dataMapper.getPersons((status, body) => {
            if (status != 200) {
                error("Could not retrieve persons table.");
                personsTable.stopSpinner();
                return;
            }

            personsTable.populate(body);
            personsTable.stopSpinner();
        });
    }

    tabs.select('persons');
}

viewPersonsTable(true);
dataMapper.getCities((status, body) => {
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

    dataMapper.createPerson(submit, (status, body) => {
        if (status != 201) {
            error("Could not create person.");
            error(body.message);
            return;
        }

        appendPerson(personsTable.lastChild, body);
        viewPersonsTable(false);
    });
});

const searchPersonForm = document.getElementById('search-person-name-form');
const searchPersonResultsTarget = document.getElementById('search-person-name-results-target');
const searchPersonResults = new HtmlTable('search-person-name-results', personColumns);
searchPersonResults.noResultsMessage = "No persons with the provided name.";
searchPersonResults.appendMessage("Press the search button to search.");
searchPersonResultsTarget.appendChild(searchPersonResults.tableElement);

searchPersonForm.addEventListener('submit', e => {
    e.preventDefault();

    const firstName = searchPersonForm.firstName.value;
    const lastName = searchPersonForm.lastName.value;
    searchPersonResults.startSpinner();
    dataMapper.searchPersonsByName(firstName, lastName, (status, response) => {
        if (status != 200) {
            error("Could not search by name.");
            searchPersonResults.stopSpinner();
            return;
        }

        searchPersonResults.populate(response);
        searchPersonResults.stopSpinner();        
    });
});
