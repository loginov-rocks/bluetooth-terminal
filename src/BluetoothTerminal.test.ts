// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// This test file uses require() style imports because the BluetoothTerminal module is exported only as a CommonJS
// module.
/* eslint-disable @typescript-eslint/no-require-imports */
const util = require('util');
const {DeviceMock, WebBluetoothMock} = require('web-bluetooth-mock');

// Avoid `Cannot redeclare block-scoped variable 'BluetoothTerminal'.ts(2451)`
const BT = require('./BluetoothTerminal');

// Import the TextEncoder and TextDecoder from the Node.js util module and add them to the global scope. These are
// natively available in browsers but need to be explicitly added in Node.js test environments. The BluetoothTerminal
// class requires these for encoding/decoding data sent to and received from Bluetooth devices.
global.TextDecoder = util.TextDecoder;
global.TextEncoder = util.TextEncoder;

describe('BluetoothTerminal', () => {
  let bt: BluetoothTerminal;

  beforeEach(() => {
    bt = new BT();
  });

  describe('setServiceUuid', () => {
    it('should accept and store a valid integer UUID', () => {
      bt.setServiceUuid(1234);
      expect(bt._serviceUuid).toBe(1234);
    });

    it('should accept and store a valid string UUID', () => {
      bt.setServiceUuid('1234-5678-9ABC-DEF0');
      expect(bt._serviceUuid).toBe('1234-5678-9ABC-DEF0');
    });

    it('should throw an error when provided a non-integer and non-string value', () => {
      expect(() => {
        bt.setServiceUuid(NaN);
      }).toThrow('Service UUID must be either an integer or a string');
    });

    it('should throw an error when provided zero as UUID', () => {
      expect(() => {
        bt.setServiceUuid(0);
      }).toThrow('Service UUID cannot be zero');
    });

    it('should throw an error when provided an empty string as UUID', () => {
      expect(() => {
        bt.setServiceUuid('  ');
      }).toThrow('Service UUID cannot be an empty string');
    });
  });

  describe('setCharacteristicUuid', () => {
    it('should accept and store a valid integer UUID', () => {
      bt.setCharacteristicUuid(1234);
      expect(bt._characteristicUuid).toBe(1234);
    });

    it('should accept and store a valid string UUID', () => {
      bt.setCharacteristicUuid('1234');
      expect(bt._characteristicUuid).toBe('1234');
    });

    it('should throw an error when provided a non-integer and non-string value', () => {
      expect(() => {
        bt.setCharacteristicUuid(NaN);
      }).toThrow('Characteristic UUID must be either an integer or a string');
    });

    it('should throw an error when provided zero as UUID', () => {
      expect(() => {
        bt.setCharacteristicUuid(0);
      }).toThrow('Characteristic UUID cannot be zero');
    });

    it('should throw an error when provided an empty string as UUID', () => {
      expect(() => {
        bt.setCharacteristicUuid('  ');
      }).toThrow('Characteristic UUID cannot be an empty string');
    });
  });

  describe('setReceiveSeparator', () => {
    it('should accept and store a single-character string separator', () => {
      bt.setReceiveSeparator('\n');
      expect(bt._receiveSeparator).toBe('\n');
    });

    it('should throw an error when provided a non-string value', () => {
      expect(() => {
        bt.setReceiveSeparator(42);
      }).toThrow('Receive separator must be a string');
    });

    it('should throw an error when provided a multi-character string', () => {
      expect(() => {
        bt.setReceiveSeparator('\r\n');
      }).toThrow('Receive separator length must be equal to one character');
    });
  });

  describe('setSendSeparator', () => {
    it('should accept and store a single-character string separator', () => {
      bt.setSendSeparator('\n');
      expect(bt._sendSeparator).toBe('\n');
    });

    it('should throw an error when provided a non-string value', () => {
      expect(() => {
        bt.setSendSeparator(42);
      }).toThrow('Send separator must be a string');
    });

    it('should throw an error when provided a multi-character string', () => {
      expect(() => {
        bt.setSendSeparator('\r\n');
      }).toThrow('Send separator length must be equal to one character');
    });
  });

  describe('setOnConnected', () => {
    it('should store the provided callback function', () => {
      const listener = () => undefined;

      bt.setOnConnected(listener);
      expect(bt._onConnected).toBe(listener);
    });

    it('should set null when no callback is provided', () => {
      bt.setOnConnected();
      expect(bt._onConnected).toBeNull();
    });

    it('should set null when null is explicitly provided', () => {
      bt.setOnConnected(null);
      expect(bt._onConnected).toBeNull();
    });

    it('should set null when undefined is explicitly provided', () => {
      bt.setOnConnected(undefined);
      expect(bt._onConnected).toBeNull();
    });

    it('should replace a previously set callback', () => {
      const firstListener = () => undefined;
      const secondListener = () => undefined;

      bt.setOnConnected(firstListener);
      expect(bt._onConnected).toBe(firstListener);

      bt.setOnConnected(secondListener);
      expect(bt._onConnected).toBe(secondListener);
    });
  });

  describe('setOnDisconnected', () => {
    it('should store the provided callback function', () => {
      const listener = () => undefined;

      bt.setOnDisconnected(listener);
      expect(bt._onDisconnected).toBe(listener);
    });

    it('should set null when no callback is provided', () => {
      bt.setOnDisconnected();
      expect(bt._onDisconnected).toBeNull();
    });

    it('should set null when null is explicitly provided', () => {
      bt.setOnDisconnected(null);
      expect(bt._onDisconnected).toBeNull();
    });

    it('should set null when undefined is explicitly provided', () => {
      bt.setOnDisconnected(undefined);
      expect(bt._onDisconnected).toBeNull();
    });

    it('should replace a previously set callback', () => {
      const firstListener = () => undefined;
      const secondListener = () => undefined;

      bt.setOnDisconnected(firstListener);
      expect(bt._onDisconnected).toBe(firstListener);

      bt.setOnDisconnected(secondListener);
      expect(bt._onDisconnected).toBe(secondListener);
    });
  });

  describe('connect', () => {
    let device: typeof DeviceMock;

    beforeEach(() => {
      device = new DeviceMock('Simon', [0xFFE0]);
      navigator.bluetooth = new WebBluetoothMock([device]);
      jest.spyOn(device.gatt, 'connect');
    });

    it('should successfully establish a Bluetooth connection with the selected device', async () => {
      await expect(bt.connect()).resolves.toBeUndefined();
      expect(device.gatt.connect).toHaveBeenCalledTimes(1);
    });

    it('should reuse the cached device on subsequent connections to avoid prompting the user multiple times',
        async () => {
          jest.spyOn(navigator.bluetooth, 'requestDevice');

          await bt.connect(); // First connection should call requestDevice().
          await bt.connect(); // Second connection should use cached device.

          return expect(navigator.bluetooth.requestDevice).toHaveBeenCalledTimes(1);
        });

    it('should reject the connection promise when no device with matching service UUID is found', () => {
      device = new DeviceMock('Simon', [1234]);
      navigator.bluetooth = new WebBluetoothMock([device]);

      return expect(bt.connect()).rejects.toThrow();
    });

    it('should invoke the onConnected callback exactly once after successfully establishing the connection',
        async () => {
          const onConnectedListener = jest.fn();
          bt.setOnConnected(onConnectedListener);

          await bt.connect();

          expect(onConnectedListener).toHaveBeenCalledTimes(1);
        });
  });

  describe('disconnect', () => {
    let device: typeof DeviceMock;

    beforeEach(() => {
      device = new DeviceMock('Simon', [0xFFE0]);
      navigator.bluetooth = new WebBluetoothMock([device]);
      jest.spyOn(device.gatt, 'disconnect');

      return bt.connect();
    });

    it('should safely disconnect only once even when disconnect() is called multiple times', () => {
      bt.disconnect();
      bt.disconnect(); // Second call shouldn't trigger another physical disconnect.

      expect(device.gatt.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should avoid attempting to disconnect an already disconnected device', () => {
      // Simulate a disconnection that happened externally by updating the Web Bluetooth API connection flag.
      device.gatt.connected = false;
      bt.disconnect();

      expect(device.gatt.disconnect).not.toHaveBeenCalled();
    });

    it('should invoke the onDisconnected callback exactly once after successfully disconnecting the device', () => {
      const onDisconnectedListener = jest.fn();
      bt.setOnDisconnected(onDisconnectedListener);

      bt.disconnect();

      expect(onDisconnectedListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('receive', () => {
    beforeEach(() => {
      const device = new DeviceMock('Simon', [0xFFE0]);
      navigator.bluetooth = new WebBluetoothMock([device]);
      jest.spyOn(bt, 'receive');

      return bt.connect();
    });

    it('should not process data until a separator character is received', () => {
      // Simulate Bluetooth data reception: set the characteristic's value to test data and dispatch the
      // `characteristicvaluechanged` event to trigger the notification handler, mimicking how the Web Bluetooth API
      // would behave when receiving data from a device.
      const characteristic = bt._characteristic;
      characteristic.value = new TextEncoder().encode('Hello, world!');
      characteristic.dispatchEvent(new CustomEvent('characteristicvaluechanged'));

      expect(bt.receive).not.toHaveBeenCalled();
    });

    it('should process data once when a single separator character is received', () => {
      // Simulate Bluetooth data reception: set the characteristic's value to test data and dispatch the
      // `characteristicvaluechanged` event to trigger the notification handler, mimicking how the Web Bluetooth API
      // would behave when receiving data from a device.
      const characteristic = bt._characteristic;
      characteristic.value = new TextEncoder().encode('Hello, world!\n');
      characteristic.dispatchEvent(new CustomEvent('characteristicvaluechanged'));

      expect(bt.receive).toHaveBeenCalledTimes(1);
      expect(bt.receive).toHaveBeenCalledWith('Hello, world!');
    });

    it('should process multiple data chunks when multiple separators are received', () => {
      // Simulate Bluetooth data reception: set the characteristic's value to test data and dispatch the
      // `characteristicvaluechanged` event to trigger the notification handler, mimicking how the Web Bluetooth API
      // would behave when receiving data from a device.
      const characteristic = bt._characteristic;
      characteristic.value = new TextEncoder().encode('Hello, world!\nCiao, mondo!\n');
      characteristic.dispatchEvent(new CustomEvent('characteristicvaluechanged'));

      expect(bt.receive).toHaveBeenCalledTimes(2);
      expect(bt.receive).toHaveBeenNthCalledWith(1, 'Hello, world!');
      expect(bt.receive).toHaveBeenNthCalledWith(2, 'Ciao, mondo!');
    });

    it('should process only complete data chunks when the ending separator is missing', () => {
      // Simulate Bluetooth data reception: set the characteristic's value to test data and dispatch the
      // `characteristicvaluechanged` event to trigger the notification handler, mimicking how the Web Bluetooth API
      // would behave when receiving data from a device.
      const characteristic = bt._characteristic;
      characteristic.value = new TextEncoder().encode('Hello, world!\nCiao, mondo!');
      characteristic.dispatchEvent(new CustomEvent('characteristicvaluechanged'));

      expect(bt.receive).toHaveBeenCalledTimes(1);
      expect(bt.receive).toHaveBeenCalledWith('Hello, world!');
    });
  });

  describe('send', () => {
    beforeEach(() => {
      const device = new DeviceMock('Simon', [0xFFE0]);
      navigator.bluetooth = new WebBluetoothMock([device]);
    });

    it('should reject when called with no parameters', () => {
      return expect(bt.send()).rejects.toThrow();
    });

    it('should reject when called with an empty string', () => {
      return expect(bt.send('')).rejects.toThrow();
    });

    it('should reject when attempting to send data without an established connection', () => {
      return expect(bt.send('Hello, world!')).rejects.toThrow();
    });

    it('should properly transmit a single-chunk message with the configured separator', async () => {
      await bt.connect();

      jest.spyOn(bt._characteristic, 'writeValue');

      await bt.send('Hello, world!');

      expect(bt._characteristic.writeValue).toHaveBeenCalledTimes(1);
      expect(bt._characteristic.writeValue).toHaveBeenCalledWith(new TextEncoder().encode('Hello, world!\n'));
    });

    it('should automatically split long messages into multiple chunks of the correct size', async () => {
      await bt.connect();

      jest.spyOn(bt._characteristic, 'writeValue');

      await bt.send('This string is longer than the default max characteristic value length of 20 chars, so it will ' +
        'trigger write value 7 times!');

      expect(bt._characteristic.writeValue).toHaveBeenCalledTimes(7);
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(1,
          new TextEncoder().encode('This string is longe'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(2,
          new TextEncoder().encode('r than the default m'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(3,
          new TextEncoder().encode('ax characteristic va'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(4,
          new TextEncoder().encode('lue length of 20 cha'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(5,
          new TextEncoder().encode('rs, so it will trigg'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(6,
          new TextEncoder().encode('er write value 7 tim'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(7,
          new TextEncoder().encode('es!\n'));
    });

    it('should handle mid-transmission disconnection by rejecting the send promise', async () => {
      await bt.connect();

      jest.spyOn(bt._characteristic, 'writeValue');

      const promise = bt.send('This string is longer than the default max characteristic value length of 20 chars!');

      expect(bt._characteristic.writeValue).toHaveBeenCalledTimes(1);
      expect(bt._characteristic.writeValue).toHaveBeenCalledWith(new TextEncoder().encode('This string is longe'));

      // Simulate a sudden device disconnection in the middle of a multi-chunk data transmission. This tests the error
      // handling when the connection is lost after the first chunk is sent but before the remaining chunks can be
      // transmitted, ensuring the promise properly rejects.
      bt.disconnect();

      expect(promise).rejects.toThrow();
    });
  });

  describe('getDeviceName', () => {
    beforeEach(() => {
      const device = new DeviceMock('Simon', [0xFFE0]);
      navigator.bluetooth = new WebBluetoothMock([device]);
    });

    it('should return an empty string when no device is connected', () => {
      expect(bt.getDeviceName()).toBe('');
    });

    it('should return the connected device name after successful connection', async () => {
      await bt.connect();

      expect(bt.getDeviceName()).toBe('Simon');
    });
  });

  describe('_stopNotifications', () => {
    it('should prevent further data reception by removing the characteristic value change listener', async () => {
      const device = new DeviceMock('Simon', [0xFFE0]);
      navigator.bluetooth = new WebBluetoothMock([device]);
      jest.spyOn(bt, 'receive');

      await bt.connect();

      const characteristic = bt._characteristic;
      characteristic.value = new TextEncoder().encode('Hello, world!\n');
      characteristic.dispatchEvent(new CustomEvent('characteristicvaluechanged'));

      expect(bt.receive).toHaveBeenCalledTimes(1);
      expect(bt.receive).toHaveBeenCalledWith('Hello, world!');

      await bt._stopNotifications(bt._characteristic);

      characteristic.value = new TextEncoder().encode('Ciao, mondo!\n');
      characteristic.dispatchEvent(new CustomEvent('characteristicvaluechanged'));

      expect(bt.receive).toHaveBeenCalledTimes(1); // Still called only once, proving notifications were stopped.
    });
  });

  describe('_handleDisconnection', () => {
    let device: typeof DeviceMock;

    beforeEach(() => {
      device = new DeviceMock('Simon', [0xFFE0]);
      navigator.bluetooth = new WebBluetoothMock([device]);
      jest.spyOn(bt, '_connectDeviceAndCacheCharacteristic');

      return bt.connect();
    });

    it('should automatically attempt reconnection when device disconnects', () => {
      expect(bt._connectDeviceAndCacheCharacteristic).toHaveBeenCalledTimes(1);

      device.dispatchEvent(new CustomEvent('gattserverdisconnected'));

      expect(bt._connectDeviceAndCacheCharacteristic).toHaveBeenCalledTimes(2);
    });

    it('should log reconnection errors when automatic reconnection fails', (done) => {
      jest.spyOn(bt, '_log');

      // Verify that connect was already called once during test setup.
      expect(bt._connectDeviceAndCacheCharacteristic).toHaveBeenCalledTimes(1);

      // Simulate a device disconnection scenario:
      // 1. Set the connected flag to false to mimic a disconnected state.
      device.gatt.connected = false;
      // 2. Override the connect method to simulate a connection failure.
      // eslint-disable-next-line prefer-promise-reject-errors
      device.gatt.connect = () => Promise.reject('Simulated error');
      // 3. Dispatch the disconnection event to trigger the reconnection attempt.
      device.dispatchEvent(new CustomEvent('gattserverdisconnected'));

      // Verify that a reconnection attempt was made (second call to connect).
      expect(bt._connectDeviceAndCacheCharacteristic).toHaveBeenCalledTimes(2);

      // Use setTimeout to wait for the Promise rejection to be processed. This allows us to verify asynchronous
      // behavior after the reconnection failure.
      setTimeout(() => {
        // Verify that the error was properly logged.
        expect(bt._log).toHaveBeenCalledWith('Simulated error');
        // Signal Jest that the asynchronous test is complete.
        done();
      }, 0);
    });

    it('should invoke the onDisconnected callback when device disconnection occurs', () => {
      const onDisconnectedListener = jest.fn();
      bt.setOnDisconnected(onDisconnectedListener);

      device.dispatchEvent(new CustomEvent('gattserverdisconnected'));

      expect(onDisconnectedListener).toHaveBeenCalledTimes(1);
    });

    it('should invoke the onConnected callback after successful automatic reconnection', (done) => {
      const onConnectedListener = jest.fn();
      bt.setOnConnected(onConnectedListener);

      device.dispatchEvent(new CustomEvent('gattserverdisconnected'));

      // Use setTimeout to defer verification until after the current call stack has completed. This allows the
      // reconnection Promise chain to resolve before we check if the onConnected callback was triggered. Without this,
      // we might check before the async reconnection process finishes.
      setTimeout(() => {
        expect(onConnectedListener).toHaveBeenCalledTimes(1);
        // Signal Jest that the asynchronous test is complete.
        done();
      }, 0);
    });
  });

  describe('_splitByLength', () => {
    it('should keep a string shorter than the specified length as a single chunk', () => {
      const result = BT._splitByLength('abcde', 6);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('abcde');
    });

    it('should handle a string exactly matching the specified length', () => {
      const result = BT._splitByLength('abcde', 5);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('abcde');
    });

    it('should split a string into multiple chunks when longer than the specified length', () => {
      const result = BT._splitByLength('abcde', 2);

      expect(result).toHaveLength(3);
      expect(result).toEqual(['ab', 'cd', 'e']);
    });

    it('should handle carriage returns properly when splitting', () => {
      const result = BT._splitByLength('a\rbcde', 3);

      expect(result).toHaveLength(2);
      expect(result).toEqual(['a\rb', 'cde']);
    });

    it('should handle line feeds properly when splitting', () => {
      const result = BT._splitByLength('abcd\ne', 3);

      expect(result).toHaveLength(2);
      expect(result).toEqual(['abc', 'd\ne']);
    });

    it('should return an empty array when given an empty string', () => {
      const result = BT._splitByLength('', 5);

      expect(result).toEqual([]);
    });
  });
});
