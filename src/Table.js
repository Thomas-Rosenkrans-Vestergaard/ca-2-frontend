/**
 * The columns in a table of companies.
 */
const company = [
    { name: "ID", key: "id", class: "company-id" },
    { name: "Name", key: "name", class: "company-name" },
    { name: "CVR", key: "cvr", class: "company-cvr" },
    { name: "Email", key: "email", class: "company-email" },
    { name: 'Address', text: row => `${row.address.street} ${row.address.information}, ${row.address.city.name}`, class: "company-address" },
    { name: 'Market value', key: "marketValue" },
    { name: 'Employees', key: 'numberOfEmployees' }
];

/**
 * The columns in a table of persons.
 */
const person = [
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

export default {company, person};