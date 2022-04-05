const signalR = require("@microsoft/signalr");

const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://api.hangzhou2net.tzkt.io/v1/events")
    .build();

async function init() {
    // open connection
    await connection.start();
    // subscribe to head
    // await connection.invoke("SubscribeToHead");
    // subscribe to account transactions
    await connection.invoke("SubscribeToOperations", {
        address: 'KT1EHBVHyZYhidHKx7HTsbrRS2j6zV7nWxvj',
        types: 'transaction'
    });
};

// auto-reconnect
connection.onclose(init);

// connection.on("head", (msg) => {
//     console.log(msg);
// });

connection.on("operations", (msg) => {
    console.log(msg);
    console.log(msg.data.length);
    const msgArr = msg.data;
    for (const item of msgArr) {
      try {
        console.log(item.target);
        console.log(item.parameter);
        console.log(item.storage);
     } catch (err) {
       console.log('Error: ', err);
      }
    }
});

init();
