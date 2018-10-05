class DataMapper {

    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    searchPersonsByName(firstName, lastName, callback) {
        let status = 1;
        fetch(this.baseUrl + 'persons/first/' + firstName + '/last/' + lastName)
            .then(response => {
                status = response.status;
                return response.json();
            })
            .then(body => callback(status, body));
    }

    createPerson(person, callback) {
        const url = this.baseUrl + "persons";
        let status = -1;
        fetch(url, {
            method: 'post',
            body: JSON.stringify(person),
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


    getFetch(url, cb) {
        let status = -1;
        fetch(url)
            .then(response => {
                status = response.status;
                return response.json();
            })
            .then(body => cb(status, body));
    }

    countPersons(cb){
        const url = this.baseUrl + "persons/count";
        this.getFetch(url, cb);
    }

    getPersons(cb) {
        const url = this.baseUrl + "persons";
        this.getFetch(url, cb);
    }

    getPersonsPaginated(pageSize, pageNumber, callback){
        const url = this.baseUrl + 'persons/paginated/' + pageSize + '/' + pageNumber;
        this.getFetch(url, callback);
    }

    getCities(cb) {
        const url = this.baseUrl + "cities";
        this.getFetch(url, cb);
    }

    deletePerson(personId, callback) {
        const url = this.baseUrl + "persons/" + personId;
        fetch(url, {
            method: 'delete',
        })
            .then(response => {
                status = response.status;
                return response.json();
            })
            .then(body => callback(status, body));
    }
}

export default DataMapper;