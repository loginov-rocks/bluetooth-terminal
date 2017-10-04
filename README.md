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

## API

### BluetoothTerminal

Bluetooth Terminal class.

**Kind**: global class

#### new BluetoothTerminal([serviceUuid], [characteristicUuid], [receiveSeparator], [sendSeparator], [sendDelay])

Create preconfigured Bluetooth Terminal instance.

| Parameter            | Type                     | Default  | Description         |
| -------------------- | ------------------------ | -------- | ------------------- |
| [serviceUuid]        | `number` &#124; `string` | `0xFFE0` | Service UUID        |
| [characteristicUuid] | `number` &#124; `string` | `0xFFE1` | Characteristic UUID |
| [receiveSeparator]   | `string`                 | `'\n'`   | Receive separator   |
| [sendSeparator]      | `string`                 | `'\n'`   | Send separator      |
| [sendDelay]          | `number`                 | `100`    | Send delay          |

#### setServiceUuid(uuid)

Set number or string representing service UUID used.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type                     | Description  |
| --------- | ------------------------ | ------------ |
| uuid      | `number` &#124; `string` | Service UUID |

#### setCharacteristicUuid(uuid)

Set number or string representing characteristic UUID used.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type                     | Description         |
| --------- | ------------------------ | ------------------- |
| uuid      | `number` &#124; `string` | Characteristic UUID |

#### setReceiveSeparator(separator)

Set character representing separator for data coming from the connected device, end of line for example.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type     | Description                                |
| --------- | -------- | ------------------------------------------ |
| separator | `string` | Receive separator with length equal to one |

#### setSendSeparator(separator)

Set string representing separator for data coming to the connected device, end of line for example.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type     | Description    |
| --------- | -------- | -------------- |
| separator | `string` | Send separator |

#### setSendDelay(delay)

Set delay between chunks of long data sending.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type     | Description           |
| --------- | -------- | --------------------- |
| delay     | `number` | Delay in milliseconds |

#### connect() ⇒ `Promise`

Launch Bluetooth device chooser and connect to the selected device.

**Kind**: instance method of `BluetoothTerminal`

**Returns**: `Promise` - Promise which will be fulfilled when notifications will be started or rejected if something
went wrong  

#### disconnect()

Disconnect from the connected device.

**Kind**: instance method of `BluetoothTerminal`

#### send(data) ⇒ `Promise`

Send data to the connected device.

**Kind**: instance method of `BluetoothTerminal`

**Returns**: `Promise` - Promise which will be fulfilled when data will be sent or rejected if something went wrong  

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| data      | `string` | Data        |

#### receive(data)

Data receiving handler which called whenever the new data comes from the connected device, override it to handle
incoming data.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| data      | `string` | Data        |

#### getDeviceName() ⇒ `string`

Get the connected device name.

**Kind**: instance method of `BluetoothTerminal`

**Returns**: `string` - Device name or empty string if not connected
