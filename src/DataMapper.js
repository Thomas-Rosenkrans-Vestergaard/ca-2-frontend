class DataMapper {

    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    searchPersonsByName(firstName, lastName, callback) {
        const url = this.baseUrl + 'persons/first/' + firstName + '/last/' + lastName
        this.getFetch(url, callback);
    }

    searchPersonsByAddress(street, city, callback){
        const url = this.baseUrl + 'persons/street/' + street + '/city/' + city
        this.getFetch(url, callback);
    }

    searchPersonsByHobby(hobbySlug, callback){
        const url = this.baseUrl + 'persons/hobby/' + hobbySlug
        this.getFetch(url, callback);
    }

    searchPersonsByPhone(phoneNumber, callback){
        const url = this.baseUrl + 'persons/phone/' + phoneNumber
        this.getFetch(url, callback);
    }

    getHobbies(callback){
        const url = this.baseUrl + 'hobbies';
        this.getFetch(url, callback);
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