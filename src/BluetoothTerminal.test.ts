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

describe('constructor', () => {
  it('should initialize with default values when no parameters are provided', () => {
    const bt = new BT();

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  it('should initialize with default values when an empty options object is provided', () => {
    const bt = new BT({});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  it('should accept and store custom integer service UUID via options object', () => {
    const bt = new BT({serviceUuid: 1234});

    expect(bt._serviceUuid).toBe(1234);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  it('should accept and store custom string service UUID via options object', () => {
    const bt = new BT({serviceUuid: '00001818-0000-1000-8000-00805f9b34fb'});

    expect(bt._serviceUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  it('should accept and store custom integer characteristic UUID via options object', () => {
    const bt = new BT({characteristicUuid: 1234});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(1234);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  it('should accept and store custom string characteristic UUID via options object', () => {
    const bt = new BT({characteristicUuid: '00001818-0000-1000-8000-00805f9b34fb'});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  it('should accept and store custom characteristic value size via options object', () => {
    const bt = new BT({characteristicValueSize: 40});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(40);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  it('should accept and store custom receive separator via options object', () => {
    const bt = new BT({receiveSeparator: ';'});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe(';');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  it('should accept and store custom send separator via options object', () => {
    const bt = new BT({sendSeparator: ';'});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe(';');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  it('should accept and store custom onConnect callback via options object', () => {
    const callback = () => undefined;
    const bt = new BT({onConnectCallback: callback});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBe(callback);
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  it('should accept and store custom onDisconnect callback via options object', () => {
    const callback = () => undefined;
    const bt = new BT({onDisconnectCallback: callback});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBe(callback);
    expect(bt._onReceiveCallback).toBeNull();
  });

  it('should accept and store custom onReceive callback via options object', () => {
    const callback = () => undefined;
    const bt = new BT({onReceiveCallback: callback});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBe(callback);
  });

  it('should accept and store all custom parameters provided via options object', () => {
    const firstCallback = () => undefined;
    const secondCallback = () => undefined;
    const thirdCallback = () => undefined;
    const bt = new BT({
      serviceUuid: 1234,
      characteristicUuid: '00001818-0000-1000-8000-00805f9b34fb',
      characteristicValueSize: 40,
      receiveSeparator: ';',
      sendSeparator: '!',
      onConnectCallback: firstCallback,
      onDisconnectCallback: secondCallback,
      onReceiveCallback: thirdCallback,
    });

    expect(bt._serviceUuid).toBe(1234);
    expect(bt._characteristicUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
    expect(bt._characteristicValueSize).toBe(40);
    expect(bt._receiveSeparator).toBe(';');
    expect(bt._sendSeparator).toBe('!');
    expect(bt._onConnectCallback).toBe(firstCallback);
    expect(bt._onDisconnectCallback).toBe(secondCallback);
    expect(bt._onReceiveCallback).toBe(thirdCallback);
  });

  // @deprecated
  it('should prioritize options object over legacy parameters when both are provided', () => {
    const firstCallback = () => undefined;
    const secondCallback = () => undefined;
    const thirdCallback = () => undefined;
    const legacyCallback = () => undefined;
    const bt = new BT(
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

  // @deprecated
  it('should accept and store custom integer service UUID', () => {
    const bt = new BT(1234);

    expect(bt._serviceUuid).toBe(1234);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  // @deprecated
  it('should accept and store custom string service UUID', () => {
    const bt = new BT('00001818-0000-1000-8000-00805f9b34fb');

    expect(bt._serviceUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  // @deprecated
  it('should accept and store custom integer characteristic UUID', () => {
    const bt = new BT(undefined, 1234);

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(1234);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  // @deprecated
  it('should accept and store custom string characteristic UUID', () => {
    const bt = new BT(undefined, '00001818-0000-1000-8000-00805f9b34fb');

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  // @deprecated
  it('should accept and store custom receive separator', () => {
    const bt = new BT(undefined, undefined, ';');

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe(';');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  // @deprecated
  it('should accept and store custom send separator', () => {
    const bt = new BT(undefined, undefined, undefined, ';');

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe(';');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  // @deprecated
  it('should accept and store custom onConnect callback', () => {
    const callback = () => undefined;
    const bt = new BT(undefined, undefined, undefined, undefined, callback);

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBe(callback);
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
  });

  // @deprecated
  it('should accept and store custom onDisconnect callback', () => {
    const callback = () => undefined;
    const bt = new BT(undefined, undefined, undefined, undefined, undefined, callback);

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBe(callback);
    expect(bt._onReceiveCallback).toBeNull();
  });

  // @deprecated
  it('should accept and store all custom parameters provided', () => {
    const firstCallback = () => undefined;
    const secondCallback = () => undefined;
    const bt = new BT(1234, '00001818-0000-1000-8000-00805f9b34fb', ';', '!', firstCallback, secondCallback);

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

describe('BluetoothTerminal', () => {
  // Using `any` type to access private members for testing purposes. This allows for thorough testing of the internal
  // state and behavior while maintaining strong encapsulation in the production code.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bt: any;

  beforeEach(() => {
    bt = new BT();
  });

  describe('setServiceUuid', () => {
    it('should accept and store a valid integer UUID', () => {
      bt.setServiceUuid(1234);
      expect(bt._serviceUuid).toBe(1234);
    });

    it('should accept and store a valid string UUID', () => {
      bt.setServiceUuid('00001818-0000-1000-8000-00805f9b34fb');
      expect(bt._serviceUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
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
      bt.setCharacteristicUuid('00001818-0000-1000-8000-00805f9b34fb');
      expect(bt._characteristicUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
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

  describe('setCharacteristicValueSize', () => {
    it('should accept and store a valid integer', () => {
      bt.setCharacteristicValueSize(40);
      expect(bt._characteristicValueSize).toBe(40);
    });

    it('should throw an error when provided a non-integer value', () => {
      expect(() => {
        bt.setCharacteristicValueSize(NaN);
      }).toThrow('Characteristic value size must be a positive integer');
    });

    it('should throw an error when provided zero as size', () => {
      expect(() => {
        bt.setCharacteristicValueSize(0);
      }).toThrow('Characteristic value size must be a positive integer');
    });

    it('should throw an error when provided a negative integer as size', () => {
      expect(() => {
        bt.setCharacteristicValueSize(-1);
      }).toThrow('Characteristic value size must be a positive integer');
    });
  });

  describe('setReceiveSeparator', () => {
    it('should accept and store a single-character string separator', () => {
      bt.setReceiveSeparator('\n');
      expect(bt._receiveSeparator).toBe('\n');
    });

    it('should throw an error when provided a non-string value', () => {
      expect(() => {
        bt.setReceiveSeparator(42 as unknown);
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
        bt.setSendSeparator(42 as unknown);
      }).toThrow('Send separator must be a string');
    });

    it('should throw an error when provided a multi-character string', () => {
      expect(() => {
        bt.setSendSeparator('\r\n');
      }).toThrow('Send separator length must be equal to one character');
    });
  });

  // @deprecated
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

  describe('onConnect', () => {
    it('should store the provided callback function', () => {
      const callback = () => undefined;

      bt.onConnect(callback);
      expect(bt._onConnectCallback).toBe(callback);
    });

    it('should set null when no callback is provided', () => {
      bt.onConnect();
      expect(bt._onConnectCallback).toBeNull();
    });

    it('should set null when null is explicitly provided', () => {
      bt.onConnect(null);
      expect(bt._onConnectCallback).toBeNull();
    });

    it('should set null when undefined is explicitly provided', () => {
      bt.onConnect(undefined);
      expect(bt._onConnectCallback).toBeNull();
    });

    it('should replace a previously set callback', () => {
      const firstCallback = () => undefined;
      const secondCallback = () => undefined;

      bt.onConnect(firstCallback);
      expect(bt._onConnectCallback).toBe(firstCallback);

      bt.onConnect(secondCallback);
      expect(bt._onConnectCallback).toBe(secondCallback);
    });
  });

  // @deprecated
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

  describe('onDisconnect', () => {
    it('should store the provided callback function', () => {
      const callback = () => undefined;

      bt.onDisconnect(callback);
      expect(bt._onDisconnectCallback).toBe(callback);
    });

    it('should set null when no callback is provided', () => {
      bt.onDisconnect();
      expect(bt._onDisconnectCallback).toBeNull();
    });

    it('should set null when null is explicitly provided', () => {
      bt.onDisconnect(null);
      expect(bt._onDisconnectCallback).toBeNull();
    });

    it('should set null when undefined is explicitly provided', () => {
      bt.onDisconnect(undefined);
      expect(bt._onDisconnectCallback).toBeNull();
    });

    it('should replace a previously set callback', () => {
      const firstCallback = () => undefined;
      const secondCallback = () => undefined;

      bt.onDisconnect(firstCallback);
      expect(bt._onDisconnectCallback).toBe(firstCallback);

      bt.onDisconnect(secondCallback);
      expect(bt._onDisconnectCallback).toBe(secondCallback);
    });
  });

  describe('onReceive', () => {
    it('should store the provided callback function', () => {
      const callback = () => undefined;

      bt.onReceive(callback);
      expect(bt._onReceiveCallback).toBe(callback);
    });

    it('should set null when no callback is provided', () => {
      bt.onReceive();
      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should set null when null is explicitly provided', () => {
      bt.onReceive(null);
      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should set null when undefined is explicitly provided', () => {
      bt.onReceive(undefined);
      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should replace a previously set callback', () => {
      const firstCallback = () => undefined;
      const secondCallback = () => undefined;

      bt.onReceive(firstCallback);
      expect(bt._onReceiveCallback).toBe(firstCallback);

      bt.onReceive(secondCallback);
      expect(bt._onReceiveCallback).toBe(secondCallback);
    });

    describe('callback', () => {
      let onReceiveCallback: jest.Func;

      beforeEach(() => {
        const device = new DeviceMock('Simon', [0xFFE0]);
        navigator.bluetooth = new WebBluetoothMock([device]);

        onReceiveCallback = jest.fn();
        bt.onReceive(onReceiveCallback);

        return bt.connect();
      });

      it('should not process data until a separator character is received', () => {
        // Simulate Bluetooth data reception: set the characteristic's value to test data and dispatch the
        // `characteristicvaluechanged` event to trigger the notification handler, mimicking how the Web Bluetooth API
        // would behave when receiving data from a device.
        const characteristic = bt._characteristic;
        characteristic.value = new TextEncoder().encode('Hello, world!');
        characteristic.dispatchEvent(new CustomEvent('characteristicvaluechanged'));

        expect(onReceiveCallback).not.toHaveBeenCalled();
      });

      it('should process data once when a single separator character is received', () => {
        // Simulate Bluetooth data reception: set the characteristic's value to test data and dispatch the
        // `characteristicvaluechanged` event to trigger the notification handler, mimicking how the Web Bluetooth API
        // would behave when receiving data from a device.
        const characteristic = bt._characteristic;
        characteristic.value = new TextEncoder().encode('Hello, world!\n');
        characteristic.dispatchEvent(new CustomEvent('characteristicvaluechanged'));

        expect(onReceiveCallback).toHaveBeenCalledTimes(1);
        expect(onReceiveCallback).toHaveBeenCalledWith('Hello, world!');
      });

      it('should process multiple data chunks when multiple separators are received', () => {
        // Simulate Bluetooth data reception: set the characteristic's value to test data and dispatch the
        // `characteristicvaluechanged` event to trigger the notification handler, mimicking how the Web Bluetooth API
        // would behave when receiving data from a device.
        const characteristic = bt._characteristic;
        characteristic.value = new TextEncoder().encode('Hello, world!\nCiao, mondo!\n');
        characteristic.dispatchEvent(new CustomEvent('characteristicvaluechanged'));

        expect(onReceiveCallback).toHaveBeenCalledTimes(2);
        expect(onReceiveCallback).toHaveBeenNthCalledWith(1, 'Hello, world!');
        expect(onReceiveCallback).toHaveBeenNthCalledWith(2, 'Ciao, mondo!');
      });

      it('should process only complete data chunks when the ending separator is missing', () => {
        // Simulate Bluetooth data reception: set the characteristic's value to test data and dispatch the
        // `characteristicvaluechanged` event to trigger the notification handler, mimicking how the Web Bluetooth API
        // would behave when receiving data from a device.
        const characteristic = bt._characteristic;
        characteristic.value = new TextEncoder().encode('Hello, world!\nCiao, mondo!');
        characteristic.dispatchEvent(new CustomEvent('characteristicvaluechanged'));

        expect(onReceiveCallback).toHaveBeenCalledTimes(1);
        expect(onReceiveCallback).toHaveBeenCalledWith('Hello, world!');
      });
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

    it('should invoke the onConnect callback exactly once after successfully establishing the connection',
        async () => {
          const onConnectCallback = jest.fn();
          bt.onConnect(onConnectCallback);

          await bt.connect();

          expect(onConnectCallback).toHaveBeenCalledTimes(1);
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

    it('should invoke the onDisconnect callback exactly once after successfully disconnecting the device', () => {
      const onDisconnectCallback = jest.fn();
      bt.onDisconnect(onDisconnectCallback);

      bt.disconnect();

      expect(onDisconnectCallback).toHaveBeenCalledTimes(1);
    });
  });

  // @deprecated
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

      await bt.send('This string is longer than the default characteristic value size of 20 chars, so it will ' +
        'trigger write value 6 times!');

      expect(bt._characteristic.writeValue).toHaveBeenCalledTimes(6);
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(1,
          new TextEncoder().encode('This string is longe'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(2,
          new TextEncoder().encode('r than the default c'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(3,
          new TextEncoder().encode('haracteristic value '));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(4,
          new TextEncoder().encode('size of 20 chars, so'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(5,
          new TextEncoder().encode(' it will trigger wri'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(6,
          new TextEncoder().encode('te value 6 times!\n'));
    });

    it('should handle mid-transmission disconnection by rejecting the send promise', async () => {
      await bt.connect();

      jest.spyOn(bt._characteristic, 'writeValue');

      const promise = bt.send('This string is longer than the default characteristic value size of 20 chars!');

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

  describe('_gattServerDisconnectedListener', () => {
    let device: typeof DeviceMock;

    beforeEach(() => {
      device = new DeviceMock('Simon', [0xFFE0]);
      navigator.bluetooth = new WebBluetoothMock([device]);
      jest.spyOn(device.gatt, 'connect');

      return bt.connect();
    });

    it('should automatically attempt reconnection when device disconnects', () => {
      expect(device.gatt.connect).toHaveBeenCalledTimes(1);

      device.dispatchEvent(new CustomEvent('gattserverdisconnected'));

      expect(device.gatt.connect).toHaveBeenCalledTimes(2);
    });

    it('should log reconnection errors when automatic reconnection fails', (done) => {
      jest.spyOn(bt, '_logError');

      // Verify that connect was already called once during test setup.
      expect(device.gatt.connect).toHaveBeenCalledTimes(1);

      // Simulate a device disconnection scenario:
      // 1. Set the connected flag to false to mimic a disconnected state.
      device.gatt.connected = false;
      // 2. Override the connect method to simulate a connection failure.
      device.gatt.connect = jest.fn(() => Promise.reject(new Error('Simulated error')));
      // 3. Dispatch the disconnection event to trigger the reconnection attempt.
      device.dispatchEvent(new CustomEvent('gattserverdisconnected'));

      // Verify that a reconnection attempt was made. Using `1` since the connect method was just overridden.
      expect(device.gatt.connect).toHaveBeenCalledTimes(1);

      // Use setTimeout to wait for the Promise rejection to be processed. This allows us to verify asynchronous
      // behavior after the reconnection failure.
      setTimeout(() => {
        // Verify that the error was properly logged.
        expect(bt._logError).toHaveBeenLastCalledWith('_gattServerDisconnectedListener',
            'Reconnection failed: "Simulated error"');
        // Signal Jest that the asynchronous test is complete.
        done();
      }, 0);
    });

    it('should invoke the onDisconnect callback when device disconnection occurs', () => {
      const onDisconnectCallback = jest.fn();
      bt.onDisconnect(onDisconnectCallback);

      device.dispatchEvent(new CustomEvent('gattserverdisconnected'));

      expect(onDisconnectCallback).toHaveBeenCalledTimes(1);
    });

    it('should invoke the onConnect callback after successful automatic reconnection', (done) => {
      const onConnectCallback = jest.fn();
      bt.onConnect(onConnectCallback);

      device.dispatchEvent(new CustomEvent('gattserverdisconnected'));

      // Use setTimeout to defer verification until after the current call stack has completed. This allows the
      // reconnection Promise chain to resolve before we check if the onConnect callback was triggered. Without this,
      // we might check before the async reconnection process finishes.
      setTimeout(() => {
        expect(onConnectCallback).toHaveBeenCalledTimes(1);
        // Signal Jest that the asynchronous test is complete.
        done();
      }, 0);
    });
  });
});
