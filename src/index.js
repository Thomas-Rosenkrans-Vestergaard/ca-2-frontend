import RestTable from './RestTable.js';
import PhoneNumberTable from './PhoneNumberTable.js';
import DataMapper from './dataMapper.js';

const companyColumns = [
    { name: "ID", key: "id", class: "company-id" },
    { name: "Name", key: "name", class: "company-name" },
    { name: "CVR", key: "cvr", class: "company-cvr" },
    { name: "Email", key: "email", class: "company-email" },
    { name: 'Address', text: row => `${row.address.street} ${row.address.information}, ${row.address.city.name}`, class: "company-address" },
    { name: 'Market value', key: "marketValue" },
    { name: 'Employees', key: 'numberOfEmployees' }
];
const personColumns = [
    { name: "ID", key: "id", class: "person-id" },
    { name: "First name", key: "firstName", class: "person-firstName" },
    { name: "Last name", key: "lastName", class: "person-lastName" },
    { name: "Email", key: "email", class: "person-email" },
    { name: 'Address', text: row => row.address == undefined ? '' : `${row.address.street} ${row.address.information}, ${row.address.city.name}`, class: "person-address" },
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

                    personsTable.refresh();
                    view('persons');
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

const baseUrl = "https://tvestergaard.com/ca-2-backend/api/";
const dataMapper = new DataMapper(baseUrl);
const tabs = M.Tabs.getInstance(document.getElementById('tabs'));

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
 * Persons table.
 */

const personsTableTarget = document.getElementById("persons-table-target");
const personsTable = new RestTable("persons-table", personColumns);
personsTable.setStartingHeight(1340);
personsTable.useLazyPagination(20, personsTableLazyPaginator, personsTableCounter);
personsTable.usePaginationButtons();
personsTable.appendTo(personsTableTarget);
personsTable.refresh();

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

/**
 * Search for people by name.
 */

const searchPersonNameForm = document.getElementById('search-person-name-form');
const searchPersonNameResultsTarget = document.getElementById('search-person-name-results-target');
const searchPersonNameResults = new RestTable('search-person-name-results', personColumns);
searchPersonNameResults.noResultsMessage = "No persons with the provided name.";
searchPersonNameResults.appendMessage("Press the search button to search.");
searchPersonNameResults.useEagerPagination(20);
searchPersonNameResults.usePaginationButtons();
searchPersonNameResults.setStartingHeight(400);
searchPersonNameResults.appendTo(searchPersonNameResultsTarget);
searchPersonNameResults.populator = (callback) => {

    dataMapper.searchPersonsByName(searchPersonNameForm.firstName.value, searchPersonNameForm.lastName.value, (status, response) => {
        if (status != 200) {
            error("Could not search by name.");
            callback([]);
            return;
        }

        callback(response);
    });
};

searchPersonNameForm.addEventListener('submit', e => {
    e.preventDefault();
    searchPersonNameResults.refresh();
});

/**
 * Search for people by address.
 */

const searchPersonAddressForm = document.getElementById('search-person-address-form');
const searchPersonAddressResultsTarget = document.getElementById('search-person-address-results-target');
const searchPersonAddressResults = new RestTable('search-person-address-results', personColumns);
searchPersonAddressResults.noResultsMessage = "No persons with the provided address.";
searchPersonAddressResults.appendMessage("Press the search button to search.");
searchPersonAddressResults.setStartingHeight(400);
searchPersonAddressResults.useEagerPagination(20);
searchPersonAddressResults.usePaginationButtons();
searchPersonAddressResults.appendTo(searchPersonAddressResultsTarget);
searchPersonAddressResults.populator = (callback) => {
    dataMapper.searchPersonsByAddress(searchPersonAddressForm.street.value, searchPersonAddressForm.city.value, (status, response) => {
        if (status != 200) {
            error("Could not search by address.");
            callback([]);
            return;
        }

        callback(response);
    });
};

searchPersonAddressForm.addEventListener('submit', e => {
    e.preventDefault();
    searchPersonAddressResults.refresh();
});

/**
 * Search for person by hobby.
 */

const searchPersonHobbyForm = document.getElementById('search-person-hobby-form');
const searchPersonHobbyResultsTarget = document.getElementById('search-person-hobby-results-target');
const searchPersonHobbyResults = new RestTable('search-person-hobby-results', personColumns);
searchPersonHobbyResults.noResultsMessage = "No persons with the provided hobby.";
searchPersonHobbyResults.appendMessage("Press the search button to search.");
searchPersonHobbyResults.setStartingHeight(400);
searchPersonHobbyResults.useEagerPagination(20);
searchPersonHobbyResults.usePaginationButtons();
searchPersonHobbyResults.appendTo(searchPersonHobbyResultsTarget);

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

searchPersonHobbyResults.populator = (callback) => {
    const hobbyId = searchPersonHobbyForm.hobby.value;

    dataMapper.searchPersonsByHobby(hobbyId, (status, response) => {
        if (status != 200) {
            error("Could not search by hobby.");
            callback([]);
            return;
        }

        callback(response);
    });
};

searchPersonHobbyForm.addEventListener('submit', e => {
    e.preventDefault();
    searchPersonHobbyResults.refresh();
});

/*
 * Search for person by phone number
 */

const searchPersonPhoneForm = document.getElementById('search-person-phone-form');
const searchPersonPhoneResultsTarget = document.getElementById('search-person-phone-results-target');
const searchPersonPhoneResults = new RestTable('search-person-phone-results', personColumns);
searchPersonPhoneResults.noResultsMessage = "No persons with the provided phone number.";
searchPersonPhoneResults.appendMessage("Press the search button to search.");
searchPersonPhoneResults.setStartingHeight(400);
searchPersonPhoneResults.useEagerPagination(20);
searchPersonPhoneResults.usePaginationButtons();
searchPersonPhoneResults.appendTo(searchPersonPhoneResultsTarget);
searchPersonPhoneResults.populator = (callback) => {
    const phone = searchPersonPhoneForm.phone.value;
    dataMapper.searchPersonsByPhone(phone, (status, response) => {
        if (status != 200) {
            error("Could not search by phone.");
            callback([]);
            return;
        }

        callback(response);
    });
};

searchPersonPhoneForm.addEventListener('submit', e => {
    e.preventDefault();
    searchPersonPhoneResults.refresh();
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
const companiesTable = new RestTable("companies-table", companyColumns);
companiesTable.useLazyPagination(20, companiesTableLazyPaginator, companiesTableCounter);
companiesTable.setStartingHeight(1040);
companiesTable.usePaginationButtons();
companiesTable.appendTo(companiesTableTarget);
companiesTable.refresh();

/**
 * Search for company by size
 */

const searchCompanySizeForm = document.getElementById('search-company-size-form');
const searchCompanySizeResultsTarget = document.getElementById('search-company-size-results-target');
const searchCompanySizeResults = new RestTable('search-company-size-results', companyColumns);
searchCompanySizeResults.noResultsMessage = "No persons matching the criteria.";
searchCompanySizeResults.appendMessage("Press the search button to search.");
searchCompanySizeResults.setStartingHeight(400);
searchCompanySizeResults.useEagerPagination(20);
searchCompanySizeResults.usePaginationButtons();
searchCompanySizeResults.appendTo(searchCompanySizeResultsTarget);
searchCompanySizeResults.populator = (callback) => {
    const minMarketValue = searchCompanySizeForm.minMarketValue.value;
    const maxMarketValue = searchCompanySizeForm.maxMarketValue.value;
    const minEmployees = searchCompanySizeForm.minEmployees.value;
    const maxEmployees = searchCompanySizeForm.maxEmployees.value;
    dataMapper.searchCompaniesBySize(minMarketValue, maxMarketValue, minEmployees, maxEmployees, (status, response) => {
        if (status != 200) {
            error("Could not search by size.");
            callback([]);
            return;
        }

        callback(response);
    });
};

searchCompanySizeForm.addEventListener('submit', e => {
    e.preventDefault();
    searchCompanySizeResults.refresh();
});

/**
 * Create person form.
 */

const createPhoneNumberTable = new PhoneNumberTable([], true);
const createPhoneNumberTableTarget = document.getElementById('create-person-phones-target');
createPhoneNumberTable.appendTo(createPhoneNumberTableTarget);

const createPersonForm = document.getElementById('create-person-form');
const createPersonFormSubmit = document.getElementById('create-person-submit');
createPersonFormSubmit.addEventListener('click', e => {

    e.preventDefault();
    if (!createPersonForm.checkValidity())
        return false;

    const person = extractPerson(createPersonForm, createPhoneNumberTable);
    dataMapper.createPerson(person, (status, body) => {

        if (status != 201) {
            error("Could not create person.");
            error(body.message);
            return;
        }

        personsTable.refresh();
        createPersonForm.reset();
        view('persons');
    });
});

/*
 * Update person form 
 */

let currentEditPerson = undefined;
const updatePhoneNumberTable = new PhoneNumberTable([], true);
const updatePhoneNumberTableTarget = document.getElementById('update-person-phones-target');
updatePhoneNumberTable.appendTo(updatePhoneNumberTableTarget);

const updatePersonForm = document.getElementById('update-person-form');
const updatePersonButton = document.getElementById('update-person-submit');
updatePersonButton.addEventListener('click', e => {
    e.preventDefault();
    if (!updatePersonForm.checkValidity())
        return false;

    const person = extractPerson(updatePersonForm, updatePhoneNumberTable);
    dataMapper.updatePerson(currentEditPerson.id, person, (status, body) => {
        
                if (status != 200) {
                    error("Could not update person.");
                    error(body.message);
                    return;
                }
        
                personsTable.refresh();
                updatePersonForm.reset();
                view('persons');
                document.getElementById('tab-update-person').classList.add('disabled');
            });
});

function extractPerson(form, phoneNumberTable) {
    return {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        address: {
            street: form.addressStreet.value,
            information: form.addressInformation.value,
            city: form.addressCity.value,
        },
        phones: phoneNumberTable.phoneNumbers
    };
}

function viewEditPerson(person) {

    currentEditPerson = person;
    document.getElementById('tab-update-person').classList.remove('disabled');
    document.getElementById('update-person-firstName').value = person['firstName'];
    document.getElementById('update-person-lastName').value = person['lastName'];
    document.getElementById('update-person-email').value = person['email'];
    document.getElementById('update-person-address-street').value = person['address']['street'];
    document.getElementById('update-person-address-information').value = person['address']['information'];

    const citySelected = document.getElementById('update-person-address-city');
    [...citySelected.children].forEach(option => {
        if (option.value == person['address']['city']['id']) {
            option.selected = 'selected';
            M.FormSelect.init(citySelected);
            return false;
        }
    });

    updatePhoneNumberTable.clear();
    updatePhoneNumberTable.addPhoneNumbers(person.phones);

    M.updateTextFields();
    view('update-person');
}