// Test file uses `require()` style imports because the BluetoothTerminal module is exported only as a CommonJS module.
/* eslint-disable @typescript-eslint/no-require-imports */
const util = require('util');
const {DeviceMock, WebBluetoothMock} = require('web-bluetooth-mock');

const BluetoothTerminal = require('./BluetoothTerminal');

// Import the TextEncoder and TextDecoder from the Node.js util module and add them to the global scope. These are
// natively available in browsers but need to be explicitly added in Node.js test environments. The BluetoothTerminal
// class requires these for encoding/decoding data sent to and received from Bluetooth devices.
global.TextDecoder = util.TextDecoder;
global.TextEncoder = util.TextEncoder;

describe('Deprecated API', () => {
  // Using `any` type to access private members for testing purposes. This allows for thorough testing of the internal
  // state and behavior while maintaining strong encapsulation in the production code.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bt: any;

  beforeEach(() => {
    bt = new BluetoothTerminal();
  });

  describe('constructor', () => {
    it('should prioritize options object over legacy parameters when both are provided', () => {
      const firstCallback = () => undefined;
      const secondCallback = () => undefined;
      const thirdCallback = () => undefined;
      const legacyCallback = () => undefined;
      const bt = new BluetoothTerminal(
          {
            serviceUuid: 1234,
            characteristicUuid: '00001818-0000-1000-8000-00805f9b34fb',
            characteristicValueSize: 40,
            receiveSeparator: ';',
            sendSeparator: '!',
            onConnectCallback: firstCallback,
            onDisconnectCallback: secondCallback,
            onReceiveCallback: thirdCallback,
          },
          5678,
          '@',
          '#',
          legacyCallback,
          legacyCallback,
      );

      expect(bt._serviceUuid).toBe(1234);
      expect(bt._characteristicUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
      expect(bt._characteristicValueSize).toBe(40);
      expect(bt._receiveSeparator).toBe(';');
      expect(bt._sendSeparator).toBe('!');
      expect(bt._onConnectCallback).toBe(firstCallback);
      expect(bt._onDisconnectCallback).toBe(secondCallback);
      expect(bt._onReceiveCallback).toBe(thirdCallback);
    });

    it('should accept and store custom integer service UUID', () => {
      const bt = new BluetoothTerminal(1234);

      expect(bt._serviceUuid).toBe(1234);
      expect(bt._characteristicUuid).toBe(0xFFE1);
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe('\n');
      expect(bt._sendSeparator).toBe('\n');
      expect(bt._onConnectCallback).toBeNull();
      expect(bt._onDisconnectCallback).toBeNull();
      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should accept and store custom string service UUID', () => {
      const bt = new BluetoothTerminal('00001818-0000-1000-8000-00805f9b34fb');

      expect(bt._serviceUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
      expect(bt._characteristicUuid).toBe(0xFFE1);
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe('\n');
      expect(bt._sendSeparator).toBe('\n');
      expect(bt._onConnectCallback).toBeNull();
      expect(bt._onDisconnectCallback).toBeNull();
      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should accept and store custom integer characteristic UUID', () => {
      const bt = new BluetoothTerminal(undefined, 1234);

      expect(bt._serviceUuid).toBe(0xFFE0);
      expect(bt._characteristicUuid).toBe(1234);
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe('\n');
      expect(bt._sendSeparator).toBe('\n');
      expect(bt._onConnectCallback).toBeNull();
      expect(bt._onDisconnectCallback).toBeNull();
      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should accept and store custom string characteristic UUID', () => {
      const bt = new BluetoothTerminal(undefined, '00001818-0000-1000-8000-00805f9b34fb');

      expect(bt._serviceUuid).toBe(0xFFE0);
      expect(bt._characteristicUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe('\n');
      expect(bt._sendSeparator).toBe('\n');
      expect(bt._onConnectCallback).toBeNull();
      expect(bt._onDisconnectCallback).toBeNull();
      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should accept and store custom receive separator', () => {
      const bt = new BluetoothTerminal(undefined, undefined, ';');

      expect(bt._serviceUuid).toBe(0xFFE0);
      expect(bt._characteristicUuid).toBe(0xFFE1);
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe(';');
      expect(bt._sendSeparator).toBe('\n');
      expect(bt._onConnectCallback).toBeNull();
      expect(bt._onDisconnectCallback).toBeNull();
      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should accept and store custom send separator', () => {
      const bt = new BluetoothTerminal(undefined, undefined, undefined, ';');

      expect(bt._serviceUuid).toBe(0xFFE0);
      expect(bt._characteristicUuid).toBe(0xFFE1);
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe('\n');
      expect(bt._sendSeparator).toBe(';');
      expect(bt._onConnectCallback).toBeNull();
      expect(bt._onDisconnectCallback).toBeNull();
      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should accept and store custom onConnect callback', () => {
      const callback = () => undefined;
      const bt = new BluetoothTerminal(undefined, undefined, undefined, undefined, callback);

      expect(bt._serviceUuid).toBe(0xFFE0);
      expect(bt._characteristicUuid).toBe(0xFFE1);
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe('\n');
      expect(bt._sendSeparator).toBe('\n');
      expect(bt._onConnectCallback).toBe(callback);
      expect(bt._onDisconnectCallback).toBeNull();
      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should accept and store custom onDisconnect callback', () => {
      const callback = () => undefined;
      const bt = new BluetoothTerminal(undefined, undefined, undefined, undefined, undefined, callback);

      expect(bt._serviceUuid).toBe(0xFFE0);
      expect(bt._characteristicUuid).toBe(0xFFE1);
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe('\n');
      expect(bt._sendSeparator).toBe('\n');
      expect(bt._onConnectCallback).toBeNull();
      expect(bt._onDisconnectCallback).toBe(callback);
      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should accept and store all custom parameters provided', () => {
      const firstCallback = () => undefined;
      const secondCallback = () => undefined;
      const bt = new BluetoothTerminal(1234, '00001818-0000-1000-8000-00805f9b34fb', ';', '!', firstCallback,
          secondCallback);

      expect(bt._serviceUuid).toBe(1234);
      expect(bt._characteristicUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe(';');
      expect(bt._sendSeparator).toBe('!');
      expect(bt._onConnectCallback).toBe(firstCallback);
      expect(bt._onDisconnectCallback).toBe(secondCallback);
      expect(bt._onReceiveCallback).toBeNull();
    });
  });

  describe('setOnConnected', () => {
    it('should store the provided callback function', () => {
      const callback = () => undefined;

      bt.setOnConnected(callback);
      expect(bt._onConnectCallback).toBe(callback);
    });

    it('should set null when no callback is provided', () => {
      bt.setOnConnected();
      expect(bt._onConnectCallback).toBeNull();
    });

    it('should set null when null is explicitly provided', () => {
      bt.setOnConnected(null);
      expect(bt._onConnectCallback).toBeNull();
    });

    it('should set null when undefined is explicitly provided', () => {
      bt.setOnConnected(undefined);
      expect(bt._onConnectCallback).toBeNull();
    });

    it('should replace a previously set callback', () => {
      const firstCallback = () => undefined;
      const secondCallback = () => undefined;

      bt.setOnConnected(firstCallback);
      expect(bt._onConnectCallback).toBe(firstCallback);

      bt.setOnConnected(secondCallback);
      expect(bt._onConnectCallback).toBe(secondCallback);
    });
  });

  describe('setOnDisconnected', () => {
    it('should store the provided callback function', () => {
      const callback = () => undefined;

      bt.setOnDisconnected(callback);
      expect(bt._onDisconnectCallback).toBe(callback);
    });

    it('should set null when no callback is provided', () => {
      bt.setOnDisconnected();
      expect(bt._onDisconnectCallback).toBeNull();
    });

    it('should set null when null is explicitly provided', () => {
      bt.setOnDisconnected(null);
      expect(bt._onDisconnectCallback).toBeNull();
    });

    it('should set null when undefined is explicitly provided', () => {
      bt.setOnDisconnected(undefined);
      expect(bt._onDisconnectCallback).toBeNull();
    });

    it('should replace a previously set callback', () => {
      const firstCallback = () => undefined;
      const secondCallback = () => undefined;

      bt.setOnDisconnected(firstCallback);
      expect(bt._onDisconnectCallback).toBe(firstCallback);

      bt.setOnDisconnected(secondCallback);
      expect(bt._onDisconnectCallback).toBe(secondCallback);
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
});
