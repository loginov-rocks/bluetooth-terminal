# bluetooth-terminal

[![npm](https://img.shields.io/npm/v/bluetooth-terminal)](https://www.npmjs.com/package/bluetooth-terminal)
[![CI](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/ci.yml/badge.svg)](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/ci.yml)
[![CD](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/cd.yml/badge.svg)](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/cd.yml)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=loginov-rocks_bluetooth-terminal&metric=coverage)](https://sonarcloud.io/summary/new_code?id=loginov-rocks_bluetooth-terminal)

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

Set integer or string representing service UUID used.

| Parameter | Type                     | Description                                                              |
| --------- | ------------------------ | ------------------------------------------------------------------------ |
| uuid      | `number` &#124; `string` | Service UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID) |

---

#### `setCharacteristicUuid(uuid)`

Set integer or string representing characteristic UUID used.

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

Requires Node.js v22.

### Scripts and Dependencies

Linting uses ESLint: `@eslint/js`, `eslint`, `eslint-config-google`, `eslint-plugin-jsdoc`, `typescript-eslint`.

- `npm run lint`

TypeScript checking uses TypeScript: `typescript`.

- `npm run typecheck`

Testing uses Jest and Web Bluetooth Mock: `@types/jest`, `babel-jest`, `jest`, `jest-environment-jsdom`,  `web-bluetooth-mock`.

- `npm test` - run tests,
- `npm run test:coverage` - run tests with coverage,
- `npm run coverage:clean` - clean coverage directory,
- `npm run coverage` - clean coverage directory and run tests with coverage.

Building uses Babel: `@babel/cli`, `@babel/core`, `@babel/preset-env`, `@babel/preset-typescript`.

- `npm run build:clean` - clean dist directory,
- `npm run build:code` - build code,
- `npm run build:types` - build TypeScript declaration,
- `npm run build` - clean dist directory, build code and TypeScript declaration.

### Logging

The logging system is implemented using simple private functions to avoid the complexity of additional classes or
decorators. This lightweight approach reduces bundle size and maintains code readability while still providing
comprehensive logging capabilities.

#### Log Levels

The class supports six hierarchical log levels (from least to most verbose):

* `none` - disables all logging output,
* `error` - only critical error messages,
* `warn` - error messages plus warnings about unexpected but non-breaking behavior,
* `info` - connection and disconnection status information, plus all warnings and errors,
* `log` - detailed connection process information, plus all info-level messages,
* `debug` - complete, verbose output of all operations, including internal method calls.

#### Log Levels Implementation

The following components log at specific levels throughout the class:

* All errors - always logged at `error` level regardless of source,
* Constructor, setter methods and callback function invocations - logged at `debug` level,
* `connect()` - primary operation logged at `info` level,
  * `_requestDevice()` - device selection logged at `debug` level,
  * `_connectDevice()` - connection details logged at `log` level,
    * `_startNotifications()` - GATT operations logged at `log` level,
* `disconnect()` - primary operation logged at `info` level (unexpected conditions at `warn`),
* `send()` - message sending logged at `debug` level,
* `characteristicvaluechanged` event listener - message reception logged at `debug` level,
* `gattserverdisconnected` event listener - reconnection logged at `log` level.

### TODO

1. Improve tests.
2. Update README.
