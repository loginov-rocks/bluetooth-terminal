# bluetooth-terminal

```javascript
// Pass service and characteristic UUIDs to the constructor to obtain configured instance
let terminal = new BluetoothTeminal(0xFFE0, 0xFFE1);

// Override `receive` method to handle incoming data as you want
terminal.receive = function(data) {
  console.log('Data coming!', data);
};

// Request the device for connection and get its name after successful connection
terminal.connect().then(() => {
  console.log(terminal.getDeviceName() + ' is connected!');
});

// Send something to the connected device
terminal.send('Simon says: Hello, world!');

// Disconnect from the connected device
terminal.disconnect();
```
