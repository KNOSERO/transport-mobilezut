const fetch = require("node-fetch");

class RestClient {

    uri = 'https://mobilezut.herokuapp.com';

    async findLocation(name) {
        return new Promise (resolve => {
            fetch(`${this.uri}/location/${name}`, {
                method: 'GET',
            })
                .then(res => res.json())
                .then(res => {
                    resolve(res);
                });
        });
    }
}

module.exports = RestClient;