# bluetooth-terminal

[![Build Status](https://travis-ci.org/1oginov/bluetooth-terminal.svg?branch=master)](https://travis-ci.org/1oginov/bluetooth-terminal)
[![devDependencies Status](https://david-dm.org/1oginov/bluetooth-terminal/dev-status.svg)](https://david-dm.org/1oginov/bluetooth-terminal?type=dev)

**BluetoothTerminal** is a class written in ES6 for serial communication with Bluetooth Low Energy (Smart) devices from
the web using [Web Bluetooth API](https://webbluetoothcg.github.io/web-bluetooth/).

With this class you can **communicate bidirectionally with your own device** through the one General Attribute Profile
characteristic that only offered by DIY modules.

Please, check out the [Web-Bluetooth-Terminal](https://github.com/1oginov/Web-Bluetooth-Terminal) repository to see
implementation details in a real life example.

## Quick start

### Install

You can use script directly or install it using [npm](https://npmjs.com) and require in your scripts.

```sh
$ npm install bluetooth-terminal
```

### Use

```javascript
// Obtain configured instance
let terminal = new BluetoothTerminal();

// Override `receive` method to handle incoming data as you want
terminal.receive = function(data) {
  alert(data);
};

// Request the device for connection and get its name after successful connection
terminal.connect().then(() => {
  alert(terminal.getDeviceName() + ' is connected!');
});

// Send something to the connected device
terminal.send('Simon says: Hello, world!');

// Disconnect from the connected device
terminal.disconnect();
```

## API

### `BluetoothTerminal`

Bluetooth Terminal class.

**Kind**: global class

* [BluetoothTerminal](#bluetoothterminal)
  * [new BluetoothTerminal([serviceUuid], [characteristicUuid], [receiveSeparator], [sendSeparator], [sendDelay])](#new-bluetoothterminalserviceuuid-characteristicuuid-receiveseparator-sendseparator-senddelay)
  * [setServiceUuid(uuid)](#setserviceuuiduuid)
  * [setCharacteristicUuid(uuid)](#setcharacteristicuuiduuid)
  * [setReceiveSeparator(separator)](#setreceiveseparatorseparator)
  * [setSendSeparator(separator)](#setsendseparatorseparator)
  * [setSendDelay(delay)](#setsenddelaydelay)
  * [connect() ⇒ `Promise`](#connect--promise)
  * [disconnect()](#disconnect)
  * [receive(data)](#receivedata)
  * [send(data) ⇒ `Promise`](#senddata--promise)
  * [getDeviceName() ⇒ `string`](#getdevicename--string)

---

#### `new BluetoothTerminal([serviceUuid], [characteristicUuid], [receiveSeparator], [sendSeparator], [sendDelay])`

Create preconfigured Bluetooth Terminal instance.

| Parameter            | Type                     | Default  | Description         |
| -------------------- | ------------------------ | -------- | ------------------- |
| [serviceUuid]        | `number` &#124; `string` | `0xFFE0` | Service UUID        |
| [characteristicUuid] | `number` &#124; `string` | `0xFFE1` | Characteristic UUID |
| [receiveSeparator]   | `string`                 | `'\n'`   | Receive separator   |
| [sendSeparator]      | `string`                 | `'\n'`   | Send separator      |
| [sendDelay]          | `number`                 | `100`    | Send delay          |

---

#### `setServiceUuid(uuid)`

Set number or string representing service UUID used.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type                     | Description  |
| --------- | ------------------------ | ------------ |
| uuid      | `number` &#124; `string` | Service UUID |

---

#### `setCharacteristicUuid(uuid)`

Set number or string representing characteristic UUID used.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type                     | Description         |
| --------- | ------------------------ | ------------------- |
| uuid      | `number` &#124; `string` | Characteristic UUID |

---

#### `setReceiveSeparator(separator)`

Set character representing separator for data coming from the connected device, end of line for example.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type     | Description                                |
| --------- | -------- | ------------------------------------------ |
| separator | `string` | Receive separator with length equal to one |

---

#### `setSendSeparator(separator)`

Set string representing separator for data coming to the connected device, end of line for example.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type     | Description    |
| --------- | -------- | -------------- |
| separator | `string` | Send separator |

---

#### `setSendDelay(delay)`

Set delay between chunks of long data sending.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type     | Description           |
| --------- | -------- | --------------------- |
| delay     | `number` | Delay in milliseconds |

---

#### `connect()` ⇒ `Promise`

Launch Bluetooth device chooser and connect to the selected device.

**Kind**: instance method of `BluetoothTerminal`

**Returns**: `Promise` - Promise which will be fulfilled when notifications will be started or rejected if something
went wrong  

---

#### `disconnect()`

Disconnect from the connected device.

**Kind**: instance method of `BluetoothTerminal`

---

#### `receive(data)`

Data receiving handler which called whenever the new data comes from the connected device, override it to handle
incoming data.

**Kind**: instance method of `BluetoothTerminal`

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| data      | `string` | Data        |

---

#### `send(data)` ⇒ `Promise`

Send data to the connected device.

**Kind**: instance method of `BluetoothTerminal`

**Returns**: `Promise` - Promise which will be fulfilled when data will be sent or rejected if something went wrong  

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| data      | `string` | Data        |

---

#### `getDeviceName()` ⇒ `string`

Get the connected device name.

**Kind**: instance method of `BluetoothTerminal`

**Returns**: `string` - Device name or empty string if not connected

## Contribution

If you want to contribute, please use the [dev](https://github.com/1oginov/bluetooth-terminal/tree/dev/) branch.
