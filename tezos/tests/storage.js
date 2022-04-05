const axios = require('axios').default;

const address = 'KT1Ua1r4kEBUQ4vP546QyCc5WK6sadvesoPu';
const name = 'operators';
const url = `https://api.hangzhou2net.tzkt.io/v1/contracts/${address}/bigmaps/${name}/keys`;


function resToTZKT(item) {
  axios.get(item)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

resToTZKT(url);
