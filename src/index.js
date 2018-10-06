import HtmlTable from './HtmlTable.js';
import DataMapper from './dataMapper.js'

const baseUrl = "http://localhost:8080/ca-2-backend/api/";
const dataMapper = new DataMapper(baseUrl);
const tabs = M.Tabs.getInstance(document.getElementById('tabs'));
const companyColumns = [
    { name: "ID", key: "id", class: "company-id" },
    { name: "Name", key: "name", class: "company-name" },
    { name: "CVR", key: "cvr", class: "company-cvr" },
    { name: "Email", key: "email", class: "company-email" },
    { name: 'Address', text: row => `${row.address.street} ${row.address.information}, ${row.address.city.name}`, class: "company-address"},
    {name: 'Market value', key: "marketValue"},
    {name: 'Employees', key: 'numberOfEmployees'}
];

const personColumns = [
    { name: "ID", key: "id", class: "person-id" },
    { name: "First name", key: "firstName", class: "person-firstName" },
    { name: "Last name", key: "lastName", class: "person-lastName" },
    { name: "Email", key: "email", class: "person-email" },
    { name: 'Address', text: row => `${row.address.street} ${row.address.information}, ${row.address.city.name}`, class: "person-address"},
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

function viewPersonsTable(refresh) {
    if (refresh) {
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

/**
 * Adds an option with the provided value and text to the provided select.
 * @param {*} value The value the option to create.
 * @param {*} text  The text value in the option to create.
 * @param {*} select The select element to append options to.
 */
function addOption(value, text, select) {
    const option = document.createElement('option');
    option.value = value;
    option.innerText = text;
    select.appendChild(option);
    return option;
}

/**
 * Displays the provided message to the user.
 * @param string message The message to display to the user.
 */
function error(message) {
    M.toast({ 'html': message });
}

/**
 * Switches to the tab with the provided name.
 * @param string page The name of the tab to display.
 */
function view(page) {
    tabs.select(page);
}

/*
 * Retrieves and fills in city select elements. 
 */

dataMapper.getCities((status, body) => {
    if (status != 200) {
        error("Could not retrieve cities.");
        return;
    }

    const selects = [
        document.getElementById('create-person-address-city'),
        document.getElementById('update-person-address-city'),
        document.getElementById('search-person-address-city')];

    selects.forEach(select => {
        body.forEach(row => {
            const option = document.createElement("option");
            option.value = row['id'];
            option.innerText = row['zipCode'] + ' ' + row['name'];
            select.appendChild(option);
        });

        M.FormSelect.init(select);
    });
});

/**
 * Initialize all persons table.
 */

function personsTableLazyPaginator(page, pageSize, callback) {
    dataMapper.getPersonsPaginated(pageSize, page, (status, rows) => {
        if (status != 200) {
            error("Could not retrieve page " + page + " for persons table.");
            return;
        }

        callback(rows);
    })
}

function personsTableCounter(callback) {
    dataMapper.countPersons((status, result) => {
        if (status != 200) {
            error("Could not count persons.");
            return;
        }

        callback(result.count);
    });
}

const personsTableTarget = document.getElementById("persons-table-target");
const personsTable = new HtmlTable("persons-table", personColumns);
personsTable.useLazyPagination(20, personsTableLazyPaginator, personsTableCounter);
personsTable.usePaginationButtons();
personsTable.page(1, 1340);
personsTableTarget.appendChild(personsTable.tableContainer);

/**
 * Search for people by name.
 */

const searchPersonNameForm = document.getElementById('search-person-name-form');
const searchPersonNameResultsTarget = document.getElementById('search-person-name-results-target');
const searchPersonNameResults = new HtmlTable('search-person-name-results', personColumns);
searchPersonNameResults.noResultsMessage = "No persons with the provided name.";
searchPersonNameResults.appendMessage("Press the search button to search.");
searchPersonNameResults.useEagerPagination(20);
searchPersonNameResults.usePaginationButtons();
searchPersonNameResults.startingHeight = 400;
searchPersonNameResultsTarget.appendChild(searchPersonNameResults.tableContainer);

searchPersonNameForm.addEventListener('submit', e => {
    e.preventDefault();

    const firstName = searchPersonNameForm.firstName.value;
    const lastName = searchPersonNameForm.lastName.value;
    searchPersonNameResults.startSpinner();
    dataMapper.searchPersonsByName(firstName, lastName, (status, response) => {
        if (status != 200) {
            error("Could not search by name.");
            searchPersonNameResults.stopSpinner();
            return;
        }

        searchPersonNameResults.populate(response);
        searchPersonNameResults.stopSpinner();
    });
});

/**
 * Search for people by address.
 */

const searchPersonAddressForm = document.getElementById('search-person-address-form');
const searchPersonAddressResultsTarget = document.getElementById('search-person-address-results-target');
const searchPersonAddressResults = new HtmlTable('search-person-address-results', personColumns);
searchPersonAddressResults.noResultsMessage = "No persons with the provided address.";
searchPersonAddressResults.appendMessage("Press the search button to search.");
searchPersonAddressResults.startingHeight = 400;
searchPersonAddressResults.useEagerPagination(20);
searchPersonAddressResults.usePaginationButtons();
searchPersonAddressResultsTarget.appendChild(searchPersonAddressResults.tableContainer);

searchPersonAddressForm.addEventListener('submit', e => {
    e.preventDefault();

    const street = searchPersonAddressForm.street.value;
    const city = searchPersonAddressForm.city.value;
    searchPersonAddressResults.startSpinner();
    dataMapper.searchPersonsByAddress(street, city, (status, response) => {
        if (status != 200) {
            error("Could not search by address.");
            searchPersonAddressResults.stopSpinner();
            return;
        }

        searchPersonAddressResults.populate(response);
        searchPersonAddressResults.stopSpinner();
    });
});

/**
 * Search for person by hobby.
 */

const searchPersonHobbyForm = document.getElementById('search-person-hobby-form');
const searchPersonHobbyResultsTarget = document.getElementById('search-person-hobby-results-target');
const searchPersonHobbyResults = new HtmlTable('search-person-hobby-results', personColumns);
searchPersonHobbyResults.noResultsMessage = "No persons with the provided hobby.";
searchPersonHobbyResults.appendMessage("Press the search button to search.");
searchPersonHobbyResults.startingHeight = 400;
searchPersonHobbyResults.useEagerPagination(20);
searchPersonHobbyResults.usePaginationButtons();
searchPersonHobbyResultsTarget.appendChild(searchPersonHobbyResults.tableContainer);

// Init hobby select
const searchPersonHobbySelect = document.getElementById('search-person-hobby');
dataMapper.getHobbies((status, response) => {
    if (status != 200) {
        error('Could not retrieve hobbies.');
        return;
    }

    response.forEach(hobby => addOption(hobby.id, hobby.name, searchPersonHobbySelect));
    M.FormSelect.init(searchPersonHobbySelect);
});

searchPersonHobbyForm.addEventListener('submit', e => {
    e.preventDefault();

    const hobbyId = searchPersonHobbyForm.hobby.value;
    searchPersonHobbyResults.startSpinner();
    dataMapper.searchPersonsByHobby(hobbyId, (status, response) => {
        if (status != 200) {
            error("Could not search by hobby.");
            searchPersonHobbyResults.stopSpinner();
            return;
        }

        searchPersonHobbyResults.populate(response);
        searchPersonHobbyResults.stopSpinner();
    });
});

/*
 * Search for person by phone number
 */

const searchPersonPhoneForm = document.getElementById('search-person-phone-form');
const searchPersonPhoneResultsTarget = document.getElementById('search-person-phone-results-target');
const searchPersonPhoneResults = new HtmlTable('search-person-phone-results', personColumns);
searchPersonPhoneResults.noResultsMessage = "No persons with the provided phone number.";
searchPersonPhoneResults.appendMessage("Press the search button to search.");
searchPersonPhoneResults.startingHeight = 400;
searchPersonPhoneResults.useEagerPagination(20);
searchPersonPhoneResults.usePaginationButtons();
searchPersonPhoneResultsTarget.appendChild(searchPersonPhoneResults.tableContainer);

searchPersonPhoneForm.addEventListener('submit', e => {
    e.preventDefault();

    const phone = searchPersonPhoneForm.phone.value;
    searchPersonPhoneResults.startSpinner();
    dataMapper.searchPersonsByPhone(phone, (status, response) => {
        if (status != 200) {
            error("Could not search by phone.");
            searchPersonPhoneResults.stopSpinner();
            return;
        }

        searchPersonPhoneResults.populate(response);
        searchPersonPhoneResults.stopSpinner();
    });
});

/**
 * Initialize all companies table.
 */

function companiesTableLazyPaginator(page, pageSize, callback) {
    dataMapper.getCompaniesPaginated(pageSize, page, (status, rows) => {
        if (status != 200) {
            error("Could not retrieve page " + page + " for companies table.");
            return;
        }

        callback(rows);
    })
}

function companiesTableCounter(callback) {
    dataMapper.countCompanies((status, result) => {
        if (status != 200) {
            error("Could not count companies.");
            return;
        }

        callback(result.count);
    });
}

const companiesTableTarget = document.getElementById("companies-table-target");
const companiesTable = new HtmlTable("companies-table", companyColumns);
companiesTable.useLazyPagination(20, companiesTableLazyPaginator, companiesTableCounter);
companiesTable.usePaginationButtons();
companiesTable.page(1, 1340);
companiesTableTarget.appendChild(companiesTable.tableContainer);

/**
 * Search for company by size
 */

const searchCompanySizeForm = document.getElementById('search-company-size-form');
const searchCompanySizeResultsTarget = document.getElementById('search-company-size-results-target');
const searchCompanySizeResults = new HtmlTable('search-company-size-results', companyColumns);
searchCompanySizeResults.noResultsMessage = "No persons matching the criteria.";
searchCompanySizeResults.appendMessage("Press the search button to search.");
searchCompanySizeResults.startingHeight = 400;
searchCompanySizeResults.useEagerPagination(20);
searchCompanySizeResults.usePaginationButtons();
searchCompanySizeResultsTarget.appendChild(searchCompanySizeResults.tableContainer);

searchCompanySizeForm.addEventListener('submit', e => {
    e.preventDefault();

    const minMarketValue = searchCompanySizeForm.minMarketValue.value;
    const maxMarketValue = searchCompanySizeForm.maxMarketValue.value;
    const minEmployees = searchCompanySizeForm.minEmployees.value;
    const maxEmployees = searchCompanySizeForm.maxEmployees.value;
    searchCompanySizeResults.startSpinner();
    dataMapper.searchCompaniesBySize(minMarketValue, maxMarketValue, minEmployees, maxEmployees, (status, response) => {
        if (status != 200) {
            error("Could not search by size.");
            searchCompanySizeResults.stopSpinner();
            return;
        }

        searchCompanySizeResults.populate(response);
        searchCompanySizeResults.stopSpinner();
    });
});