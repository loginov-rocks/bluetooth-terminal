# bluetooth-terminal

[![npm](https://img.shields.io/npm/v/bluetooth-terminal)](https://www.npmjs.com/package/bluetooth-terminal)
[![CI](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/ci.yml/badge.svg)](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/ci.yml)
[![CD](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/cd.yml/badge.svg)](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/cd.yml)
[![Coverage Status](https://coveralls.io/repos/github/loginov-rocks/bluetooth-terminal/badge.svg?branch=main)](https://coveralls.io/github/loginov-rocks/bluetooth-terminal?branch=main)

**BluetoothTerminal** is a class written in ES6 for serial communication with Bluetooth Low Energy (Smart) devices from
the web using [Web Bluetooth API](https://webbluetoothcg.github.io/web-bluetooth/).

With this class you can **communicate bidirectionally with your own device** through the one General Attribute Profile
characteristic that only offered by DIY modules.

Please check out the [Web-Bluetooth-Terminal](https://github.com/loginov-rocks/Web-Bluetooth-Terminal) repository to see
implementation details in a real life example.

## Quick Start

### Install

You can use the [script](https://github.com/loginov-rocks/bluetooth-terminal/blob/main/src/BluetoothTerminal.js)
directly or install it using [npm](https://npmjs.com) and require in your code.

```sh
npm install bluetooth-terminal
```

### Use

```js
// Obtain configured instance.
let terminal = new BluetoothTerminal();

// Override `receive` method to handle incoming data as you want.
terminal.receive = function(data) {
  alert(data);
};

// Request the device for connection and get its name after successful connection.
terminal.connect().then(() => {
  alert(terminal.getDeviceName() + ' is connected!');
});

// Send something to the connected device.
terminal.send('Simon says: Hello, world!');

// Disconnect from the connected device.
terminal.disconnect();
```

## API

### `BluetoothTerminal`

Bluetooth Terminal class.

<!-- no toc -->
* [BluetoothTerminal](#bluetoothterminal)
  * [new BluetoothTerminal([serviceUuid], [characteristicUuid], [receiveSeparator], [sendSeparator], [onConnected], [onDisconnected])](#new-bluetoothterminalserviceuuid-characteristicuuid-receiveseparator-sendseparator-onconnected-ondisconnected)
  * [setServiceUuid(uuid)](#setserviceuuiduuid)
  * [setCharacteristicUuid(uuid)](#setcharacteristicuuiduuid)
  * [setReceiveSeparator(separator)](#setreceiveseparatorseparator)
  * [setSendSeparator(separator)](#setsendseparatorseparator)
  * [setOnConnected([listener])](#setonconnectedlistener)
  * [setOnDisconnected([listener])](#setondisconnectedlistener)
  * [connect() ⇒ Promise](#connect--promise)
  * [disconnect()](#disconnect)
  * [receive(data)](#receivedata)
  * [send(data) ⇒ Promise](#senddata--promise)
  * [getDeviceName() ⇒ string](#getdevicename--string)

---

#### `new BluetoothTerminal([serviceUuid], [characteristicUuid], [receiveSeparator], [sendSeparator], [onConnected], [onDisconnected])`

Create preconfigured Bluetooth Terminal instance.

| Parameter            | Type                                        | Default     | Description                                                                              |
| -------------------- | ------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| [serviceUuid]        | `number` &#124; `string`                    | `0xFFE0`    | Optional service UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID)        |
| [characteristicUuid] | `number` &#124; `string`                    | `0xFFE1`    | Optional characteristic UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID) |
| [receiveSeparator]   | `string`                                    | `'\n'`      | Optional receive separator with length equal to one character                            |
| [sendSeparator]      | `string`                                    | `'\n'`      | Optional send separator with length equal to one character                               |
| [onConnected]        | `Function` &#124; `null` &#124; `undefined` | `undefined` | Optional callback for connection completion                                              |
| [onDisconnected]     | `Function` &#124; `null` &#124; `undefined` | `undefined` | Optional callback for disconnection                                                      |

---

#### `setServiceUuid(uuid)`

Set number or string representing service UUID used.

| Parameter | Type                     | Description                                                              |
| --------- | ------------------------ | ------------------------------------------------------------------------ |
| uuid      | `number` &#124; `string` | Service UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID) |

---

#### `setCharacteristicUuid(uuid)`

Set number or string representing characteristic UUID used.

| Parameter | Type                     | Description                                                                     |
| --------- | ------------------------ | ------------------------------------------------------------------------------- |
| uuid      | `number` &#124; `string` | Characteristic UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID) |

---

#### `setReceiveSeparator(separator)`

Set character representing separator for data coming from the connected device, end of line for example.

| Parameter | Type     | Description                                          |
| --------- | -------- | ---------------------------------------------------- |
| separator | `string` | Receive separator with length equal to one character |

---

#### `setSendSeparator(separator)`

Set string representing separator for data coming to the connected device, end of line for example.

| Parameter | Type     | Description                                       |
| --------- | -------- | ------------------------------------------------- |
| separator | `string` | Send separator with length equal to one character |

---

#### `setOnConnected([listener])`

Set a listener that will be called after the device is fully connected and communication has started.

| Parameter  | Type                                        | Description                                                               |
| ---------- | ------------------------------------------- | ------------------------------------------------------------------------- |
| [listener] | `Function` &#124; `null` &#124; `undefined` | Callback for successful connection; omit or pass null/undefined to remove |

---

#### `setOnDisconnected([listener])`

Set a listener that will be called after the device is disconnected.

| Parameter  | Type                                        | Description                                                       |
| ---------- | ------------------------------------------- | ----------------------------------------------------------------- |
| [listener] | `Function` &#124; `null` &#124; `undefined` | Callback for disconnection; omit or pass null/undefined to remove |

---

#### `connect()` ⇒ `Promise`

Launch the browser Bluetooth device picker, connect to the selected device, and start communication.

If set, the `onConnected()` callback function will be executed after the connection starts.

**Returns**: `Promise` - Promise that resolves when the device is fully connected and communication started, or rejects
if an error occurs.

---

#### `disconnect()`

Disconnect from the currently connected device.

If set, the `onDisconnected()` callback function will be executed after the disconnection.

---

#### `receive(data)`

Handler for incoming data from the connected device. Override this method to process data received from the connected
device.

| Parameter | Type     | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| data      | `string` | String data received from the connected device |

---

#### `send(data)` ⇒ `Promise`

Send data to the connected device. The data is automatically split into chunks if it exceeds the maximum characteristic
value length.

**Returns**: `Promise` - Promise that resolves when all data has been sent, or rejects if an error occurs

| Parameter | Type     | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| data      | `string` | String data to be sent to the connected device |

---

#### `getDeviceName()` ⇒ `string`

Get the name of the currently connected device.

**Returns**: `string` - Name of the connected device or an empty string if no device is connected

## Development

Uses:

- Node.js v22
- ESLint for linting: `eslint`, `@eslint/js`, `eslint-config-google`, `typescript-eslint`, `eslint-plugin-jsdoc`
- TypeScript for type checks and building declaration: `typescript`

Scripts:

- `npm run lint` - linting
- `npm run typecheck` - run TypeScript type checks
- `npm run build:types` - build TypeScript declaration

### TODO

1. Complete refactoring to async/await
2. Remove `lib/BluetoothTerminal.test.d.ts` after building TypeScript declarations
