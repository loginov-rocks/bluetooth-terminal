# bluetooth-terminal

[![npm](https://img.shields.io/npm/v/bluetooth-terminal)](https://www.npmjs.com/package/bluetooth-terminal)
[![CI](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/ci.yml/badge.svg)](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/ci.yml)
[![CD](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/cd.yml/badge.svg)](https://github.com/loginov-rocks/bluetooth-terminal/actions/workflows/cd.yml)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=loginov-rocks_bluetooth-terminal&metric=coverage)](https://sonarcloud.io/summary/new_code?id=loginov-rocks_bluetooth-terminal)

**BluetoothTerminal** is a specialized JavaScript class that bridges a critical gap in web-based Bluetooth
communication. It enables real **bidirectional serial communication** with *Bluetooth Low Energy (BLE)* devices
directly from web browsers using the [Web Bluetooth API](https://webbluetoothcg.github.io/web-bluetooth/).

Check out the [Web Bluetooth Terminal](https://github.com/loginov-rocks/Web-Bluetooth-Terminal) repository for a
complete implementation example, or read the full tutorial on
[building web apps for your own BLE devices](https://loginov-rocks.medium.com/how-to-make-a-web-app-for-your-own-bluetooth-low-energy-device-arduino-2af8d16fdbe8).

### Problem

Web browsers can only communicate with *Bluetooth Low Energy (4.0+)* devices through the **Web Bluetooth API**, which
uses the *Generic Attribute Profile (GATT)* with services and characteristics. However, most affordable BLE modules
available to hobbyists and makers (such as *HM-10*, *JDY-08*, *AT-09*, *CC41-A*) only expose a single service
(typically `0xFFE0`) and characteristic (typically `0xFFE1`) that emulates basic serial communication.

These limitations present several challenges:

* No native *Serial Port Profile* support in **Web Bluetooth API**.
* 20-byte size limit for individual BLE characteristic values.
* Need for a consistent communication protocol between web apps and DIY hardware.

### Solution

This class provides a complete solution by:

* Creating a robust **serial communication layer** on top of the **Web Bluetooth API**.
* Automatically handling device discovery, connection, and reconnection.
* Bypassing the 20-byte characteristic limitation by automatically chunking longer messages.
* Managing message buffering until complete messages are received (using configurable delimiters).
* Providing a simple, Promise-based API for sending and receiving data.

With **BluetoothTerminal**, you can build web applications that seamlessly communicate with your custom *BLE* hardware
by sending and receiving:

* text messages,
* JSON data from sensors,
* commands and control signals,
* any other data you need to exchange with your device.

This enables entirely new possibilities for creating web-controlled IoT devices, remote sensors, and other
Bluetooth-enabled projects without needing native mobile applications.

## Quick Start

### Install

**BluetoothTerminal** can be added to your project in two ways:

1. *Direct script usage:* download and include the
[prebuilt JavaScript file](https://www.npmjs.com/package/bluetooth-terminal?activeTab=code)
(`dist/BluetoothTerminal.js`) directly in your HTML:

```html
<script src="path/to/BluetoothTerminal.js"></script>
```

2. *NPM package:* for projects using module bundlers (Webpack, Rollup, Parcel, etc.), install via npm:

```sh
npm install bluetooth-terminal
```

Then import in your code:

```js
const BluetoothTerminal = require('bluetooth-terminal');
```

### Use

```js
// Create a BluetoothTerminal instance with the default configuration.
const bluetoothTerminal = new BluetoothTerminal();

// Set a callback that will be called when an incoming message from the
// connected device is received.
bluetoothTerminal.onReceive((message) => {
  console.info(`Message received: "${message}"`);
});

// Open the browser Bluetooth device picker to select a device if none was
// previously selected, establish a connection with the selected device, and
// initiate communication.
bluetoothTerminal.connect()
  .then(() => {
    // Retrieve the name of the currently connected device.
    console.info(`Device "${this.getDeviceName()}" successfully connected`);
    
    // Send a message to the connected device.
    return bluetoothTerminal.send('Simon says: Hello, world!');
  });

// Later, disconnect from the currently connected device and clean up
// associated resources.
// bluetoothTerminal.disconnect();
```

## Contents

<!-- no toc -->
- [API](#api)
  - [BluetoothTerminal](#bluetoothterminal)
    - [new BluetoothTerminal([optionsOrServiceUuid], [characteristicUuid], [receiveSeparator], [sendSeparator], [onConnectCallback], [onDisconnectCallback])](#new-bluetoothterminaloptionsorserviceuuid-characteristicuuid-receiveseparator-sendseparator-onconnectcallback-ondisconnectcallback)
      - [BluetoothTerminalOptions](#bluetoothterminaloptions)
    - [setServiceUuid(uuid)](#setserviceuuiduuid)
    - [setCharacteristicUuid(uuid)](#setcharacteristicuuiduuid)
    - [setCharacteristicValueSize(size)](#setcharacteristicvaluesizesize)
    - [setReceiveSeparator(separator)](#setreceiveseparatorseparator)
    - [setSendSeparator(separator)](#setsendseparatorseparator)
    - [onConnect([callback])](#onconnectcallback)
    - [onDisconnect([callback])](#ondisconnectcallback)
    - [onReceive([callback])](#onreceivecallback)
    - [onLog([callback])](#onlogcallback)
    - [setLogLevel(logLevel)](#setloglevelloglevel)
    - [connect() ⇒ Promise](#connect--promise)
    - [disconnect()](#disconnect)
    - [send(message) ⇒ Promise](#sendmessage--promise)
    - [getDeviceName() ⇒ string](#getdevicename--string)
    - [Deprecated API](#deprecated-api)
      - [setOnConnected([callback])](#setonconnectedcallback)
      - [setOnDisconnected([callback])](#setondisconnectedcallback)
      - [receive(message)](#receivemessage)
- [Development](#development)
  - [Runtime Dependencies](#runtime-dependencies)
  - [Scripts and Development Dependencies](#scripts-and-development-dependencies)
  - [Logging](#logging)
    - [Log Levels](#log-levels)
    - [Log Levels Implementation](#log-levels-implementation)

## API

### `BluetoothTerminal`

BluetoothTerminal class.

---

#### `new BluetoothTerminal([optionsOrServiceUuid], [characteristicUuid], [receiveSeparator], [sendSeparator], [onConnectCallback], [onDisconnectCallback])`

Creates a BluetoothTerminal instance with the provided configuration.

Supports both options object (preferred) and individual parameters (deprecated and will be removed in v2.0.0).

| Parameter                | Type                                               | Default  | Description                                                                                         |
| ------------------------ | -------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `[optionsOrServiceUuid]` | `BluetoothTerminalOptions` \| `number` \| `string` | `0xFFE0` | Optional options object or service UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID) |
| `[characteristicUuid]`   | `number` \| `string`                               | `0xFFE1` | Optional characteristic UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID)            |
| `[receiveSeparator]`     | `string`                                           | `'\n'`   | Optional receive separator with length equal to one character                                       |
| `[sendSeparator]`        | `string`                                           | `'\n'`   | Optional send separator with length equal to one character                                          |
| `[onConnectCallback]`    | `() => void`                                       | `null`   | Optional callback for successful connection                                                         |
| `[onDisconnectCallback]` | `() => void`                                       | `null`   | Optional callback for disconnection                                                                 |

##### `BluetoothTerminalOptions`

| Property                    | Type                                                                           | Default  | Description                                                                              |
| --------------------------- | ------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------- |
| `[serviceUuid]`             | `number` \| `string`                                                           | `0xFFE0` | Optional service UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID)        |
| `[characteristicUuid]`      | `number` \| `string`                                                           | `0xFFE1` | Optional characteristic UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID) |
| `[characteristicValueSize]` | `number`                                                                       | `20`     | Optional maximum characteristic value size in bytes (positive integer)                   |
| `[receiveSeparator]`        | `string`                                                                       | `'\n'`   | Optional receive separator with length equal to one character                            |
| `[sendSeparator]`           | `string`                                                                       | `'\n'`   | Optional send separator with length equal to one character                               |
| `[onConnectCallback]`       | `() => void`                                                                   | `null`   | Optional callback for successful connection                                              |
| `[onDisconnectCallback]`    | `() => void`                                                                   | `null`   | Optional callback for disconnection                                                      |
| `[onReceiveCallback]`       | `(message: string) => void`                                                    | `null`   | Optional callback for incoming message                                                   |
| `[onLogCallback]`           | `(logLevel: string, method: string, message: string, error?: unknown) => void` | `null`   | Optional callback for log messages                                                       |
| `[logLevel]`                | `string`                                                                       | `'log'`  | Optional log level as a string ("none", "error", "warn", "info", "log", or "debug")      |

---

#### `setServiceUuid(uuid)`

Sets integer or string representing service UUID used.

| Parameter | Type                 | Description                                                              |
| --------- | -------------------- | ------------------------------------------------------------------------ |
| `uuid`    | `number` \| `string` | Service UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID) |

---

#### `setCharacteristicUuid(uuid)`

Sets integer or string representing characteristic UUID used.

| Parameter | Type                 | Description                                                                     |
| --------- | -------------------- | ------------------------------------------------------------------------------- |
| `uuid`    | `number` \| `string` | Characteristic UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID) |

---

#### `setCharacteristicValueSize(size)`

Sets the maximum size (in bytes) for each characteristic write operation. Larger messages will be automatically split
into chunks of this size.

| Parameter | Type     | Description                                                   |
| --------- | -------- | ------------------------------------------------------------- |
| size      | `number` | Maximum characteristic value size in bytes (positive integer) |

---

#### `setReceiveSeparator(separator)`

Sets character representing separator for messages received from the connected device, end of line for example.

| Parameter   | Type     | Description                                          |
| ----------- | -------- | ---------------------------------------------------- |
| `separator` | `string` | Receive separator with length equal to one character |

---

#### `setSendSeparator(separator)`

Sets character representing separator for messages sent to the connected device, end of line for example.

| Parameter   | Type     | Description                                       |
| ----------- | -------- | ------------------------------------------------- |
| `separator` | `string` | Send separator with length equal to one character |

---

#### `onConnect([callback])`

Sets a callback that will be called after the device is fully connected and communication has started.

| Parameter    | Type                                  | Description                                                               |
| ------------ | ------------------------------------- | ------------------------------------------------------------------------- |
| `[callback]` | `() => void` \| `null` \| `undefined` | Callback for successful connection; omit or pass null/undefined to remove |

---

#### `onDisconnect([callback])`

Sets a callback that will be called after the device is disconnected.

| Parameter    | Type                                  | Description                                                       |
| ------------ | ------------------------------------- | ----------------------------------------------------------------- |
| `[callback]` | `() => void` \| `null` \| `undefined` | Callback for disconnection; omit or pass null/undefined to remove |

---

#### `onReceive([callback])`

Sets a callback that will be called when an incoming message from the connected device is received.

| Parameter    | Type                                                 | Description                                                          |
| ------------ | ---------------------------------------------------- | -------------------------------------------------------------------- |
| `[callback]` | `(message: string) => void` \| `null` \| `undefined` | Callback for incoming message; omit or pass null/undefined to remove |

---

#### `onLog([callback])`

Sets a callback that will be called every time any log message is produced by the class, regardless of the log level
set.

| Parameter    | Type                                                                                                    | Description                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `[callback]` | `(logLevel: string, method: string, message: string, error?: unknown) => void` \| `null` \| `undefined` | Callback for log messages; omit or pass null/undefined to remove |

---

#### `setLogLevel(logLevel)`

Sets the log level that controls which messages are displayed in the console. The level hierarchy (from least to most
verbose) is: "none", "error", "warn", "info", "log", "debug". Each level includes all less verbose levels.

| Parameter  | Type     | Description                                                                |
| ---------- | -------- | -------------------------------------------------------------------------- |
| `logLevel` | `string` | Log level as a string ("none", "error", "warn", "info", "log", or "debug") |

---

#### `connect()` ⇒ `Promise`

Opens the browser Bluetooth device picker to select a device if none was previously selected, establishes a connection
with the selected device, and initiates communication.

If configured, the `onConnect()` callback function will be executed after the connection is established.

**Returns**: `Promise` - Promise that resolves when the device is fully connected and communication has started, or
rejects if an error occurs.

---

#### `disconnect()`

Disconnects from the currently connected device and cleans up associated resources.

If configured, the `onDisconnect()` callback function will be executed after the complete disconnection.

---

#### `send(message)` ⇒ `Promise`

Sends a message to the connected device, automatically adding the configured send separator and splitting the message
into appropriate chunks if it exceeds the maximum characteristic value size.

| Parameter | Type     | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| `message` | `string` | String message to send to the connected device |

**Returns**: `Promise` - Promise that resolves when message successfully sent, or rejects if the device is disconnected
or an error occurs.

---

#### `getDeviceName()` ⇒ `string`

Retrieves the name of the currently connected device.

**Returns**: `string` - Device name or an empty string if no device is connected or has no name.

---

#### Deprecated API

##### `setOnConnected([callback])`

Sets a callback that will be called after the device is fully connected and communication has started.

| Parameter    | Type                                  | Description                                                               |
| ------------ | ------------------------------------- | ------------------------------------------------------------------------- |
| `[callback]` | `() => void` \| `null` \| `undefined` | Callback for successful connection; omit or pass null/undefined to remove |

---

##### `setOnDisconnected([callback])`

Sets a callback that will be called after the device is disconnected.

| Parameter    | Type                                  | Description                                                       |
| ------------ | ------------------------------------- | ----------------------------------------------------------------- |
| `[callback]` | `() => void` \| `null` \| `undefined` | Callback for disconnection; omit or pass null/undefined to remove |

---

##### `receive(message)`

Handler for incoming messages received from the connected device. Override this method to process messages received
from the connected device. Each time a complete message (ending with the receive separator) is processed, this method
will be called with the message string.

| Parameter | Type     | Description                                                                |
| --------- | -------- | -------------------------------------------------------------------------- |
| `message` | `string` | String message received from the connected device, with separators removed |

## Development

Requires Node.js v22 (for development only).

### Runtime Dependencies

The class is designed to have zero runtime dependencies as it should be easily used in browser applications.

### Scripts and Development Dependencies

Linting uses ESLint: `@eslint/js`, `eslint`, `eslint-config-google`, `eslint-plugin-jsdoc`, `typescript-eslint`

- `npm run lint`

TypeScript checking uses TypeScript: `typescript`.

- `npm run typecheck`

Testing uses Jest and Web Bluetooth Mock: `@types/jest`, `babel-jest`, `jest`, `jest-environment-jsdom`, 
`web-bluetooth-mock`

- `npm test` - run tests,
- `npm run test:coverage` - run tests with coverage,
- `npm run coverage:clean` - clean coverage directory,
- `npm run coverage` - clean coverage directory and run tests with coverage.

Building uses Babel: `@babel/cli`, `@babel/core`, `@babel/preset-env`, `@babel/preset-typescript`

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
