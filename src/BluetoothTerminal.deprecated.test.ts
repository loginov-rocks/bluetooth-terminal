// Test file uses `require()` style imports because the BluetoothTerminal module is exported only as a CommonJS module.
/* eslint-disable @typescript-eslint/no-require-imports */
// Import the `TextEncoder` and `TextDecoder` from the Node.js `util` module and add them to the global scope. These
// are natively available in browsers but need to be explicitly added in Node.js test environments. The
// `BluetoothTerminal` class requires these for encoding/decoding messages sent to and received from Bluetooth devices.
const util = require('util');
global.TextDecoder = util.TextDecoder;
global.TextEncoder = util.TextEncoder;

const {DeviceMock, WebBluetoothMock} = require('web-bluetooth-mock');

const BluetoothTerminal = require('./BluetoothTerminal');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const changeCharacteristicValue = (bluetoothTerminal: any, value: string) => {
  // Simulate Bluetooth characteristic value change: set value and dispatch the `characteristicvaluechanged` event to
  // trigger the notification handler, mimicking how the Web Bluetooth API would behave when receiving data from the
  // connected device.
  const characteristic = bluetoothTerminal._characteristic;
  characteristic.value = new TextEncoder().encode(value);
  characteristic.dispatchEvent(new CustomEvent('characteristicvaluechanged'));
};

describe('Deprecated API', () => {
  describe('Constructor', () => {
    it('should prioritize the options object over deprecated parameters when both are provided', () => {
      const firstCallback = () => undefined;
      const secondCallback = () => undefined;
      const thirdCallback = () => undefined;
      const fourthCallback = () => undefined;
      const firstDeprecatedCallback = () => undefined;
      const secondDeprecatedCallback = () => undefined;

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
            onLogCallback: fourthCallback,
            logLevel: 'debug',
          },
          5678,
          '@',
          '#',
          firstDeprecatedCallback,
          secondDeprecatedCallback,
      );

      expect(bt._serviceUuid).toBe(1234);
      expect(bt._characteristicUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
      expect(bt._characteristicValueSize).toBe(40);
      expect(bt._receiveSeparator).toBe(';');
      expect(bt._sendSeparator).toBe('!');
      expect(bt._onConnectCallback).toBe(firstCallback);
      expect(bt._onDisconnectCallback).toBe(secondCallback);
      expect(bt._onReceiveCallback).toBe(thirdCallback);
      expect(bt._onLogCallback).toBe(fourthCallback);
      expect(bt._logLevel).toBe('debug');
    });

    it('should accept and store a custom integer service UUID while keeping the rest of the default configuration',
        () => {
          const bt = new BluetoothTerminal(1234);

          expect(bt._serviceUuid).toBe(1234);
          expect(bt._characteristicUuid).toBe(0xFFE1);
          expect(bt._characteristicValueSize).toBe(20);
          expect(bt._receiveSeparator).toBe('\n');
          expect(bt._sendSeparator).toBe('\n');
          expect(bt._onConnectCallback).toBeNull();
          expect(bt._onDisconnectCallback).toBeNull();
          expect(bt._onReceiveCallback).toBeNull();
          expect(bt._onLogCallback).toBeNull();
          expect(bt._logLevel).toBe('log');
        });

    it('should accept and store a custom string service UUID while keeping the rest of the default configuration',
        () => {
          const bt = new BluetoothTerminal('00001818-0000-1000-8000-00805f9b34fb');

          expect(bt._serviceUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
          expect(bt._characteristicUuid).toBe(0xFFE1);
          expect(bt._characteristicValueSize).toBe(20);
          expect(bt._receiveSeparator).toBe('\n');
          expect(bt._sendSeparator).toBe('\n');
          expect(bt._onConnectCallback).toBeNull();
          expect(bt._onDisconnectCallback).toBeNull();
          expect(bt._onReceiveCallback).toBeNull();
          expect(bt._onLogCallback).toBeNull();
          expect(bt._logLevel).toBe('log');
        });

    it('should accept and store a custom integer characteristic UUID while keeping the rest of the default ' +
      'configuration', () => {
      const bt = new BluetoothTerminal(undefined, 1234);

      expect(bt._serviceUuid).toBe(0xFFE0);
      expect(bt._characteristicUuid).toBe(1234);
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe('\n');
      expect(bt._sendSeparator).toBe('\n');
      expect(bt._onConnectCallback).toBeNull();
      expect(bt._onDisconnectCallback).toBeNull();
      expect(bt._onReceiveCallback).toBeNull();
      expect(bt._onLogCallback).toBeNull();
      expect(bt._logLevel).toBe('log');
    });

    it('should accept and store a custom string characteristic UUID while keeping the rest of the default ' +
      'configuration', () => {
      const bt = new BluetoothTerminal(undefined, '00001818-0000-1000-8000-00805f9b34fb');

      expect(bt._serviceUuid).toBe(0xFFE0);
      expect(bt._characteristicUuid).toBe('00001818-0000-1000-8000-00805f9b34fb');
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe('\n');
      expect(bt._sendSeparator).toBe('\n');
      expect(bt._onConnectCallback).toBeNull();
      expect(bt._onDisconnectCallback).toBeNull();
      expect(bt._onReceiveCallback).toBeNull();
      expect(bt._onLogCallback).toBeNull();
      expect(bt._logLevel).toBe('log');
    });

    it('should accept and store a custom receive separator while keeping the rest of the default configuration', () => {
      const bt = new BluetoothTerminal(undefined, undefined, ';');

      expect(bt._serviceUuid).toBe(0xFFE0);
      expect(bt._characteristicUuid).toBe(0xFFE1);
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe(';');
      expect(bt._sendSeparator).toBe('\n');
      expect(bt._onConnectCallback).toBeNull();
      expect(bt._onDisconnectCallback).toBeNull();
      expect(bt._onReceiveCallback).toBeNull();
      expect(bt._onLogCallback).toBeNull();
      expect(bt._logLevel).toBe('log');
    });

    it('should accept and store a custom send separator while keeping the rest of the default configuration', () => {
      const bt = new BluetoothTerminal(undefined, undefined, undefined, ';');

      expect(bt._serviceUuid).toBe(0xFFE0);
      expect(bt._characteristicUuid).toBe(0xFFE1);
      expect(bt._characteristicValueSize).toBe(20);
      expect(bt._receiveSeparator).toBe('\n');
      expect(bt._sendSeparator).toBe(';');
      expect(bt._onConnectCallback).toBeNull();
      expect(bt._onDisconnectCallback).toBeNull();
      expect(bt._onReceiveCallback).toBeNull();
      expect(bt._onLogCallback).toBeNull();
      expect(bt._logLevel).toBe('log');
    });

    it('should accept and store a custom onConnect callback while keeping the rest of the default configuration',
        () => {
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
          expect(bt._onLogCallback).toBeNull();
          expect(bt._logLevel).toBe('log');
        });

    it('should accept and store a custom onDisconnect callback while keeping the rest of the default configuration',
        () => {
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
          expect(bt._onLogCallback).toBeNull();
          expect(bt._logLevel).toBe('log');
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
      expect(bt._onLogCallback).toBeNull();
      expect(bt._logLevel).toBe('log');
    });
  });

  describe('Setters', () => {
    // Using `any` type to access private members for testing purposes. This allows for thorough testing of the
    // internal state and behavior while maintaining strong encapsulation in the production code.
    let bt: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    beforeEach(() => {
      bt = new BluetoothTerminal();
    });

    describe('setOnConnected', () => {
      it('should store the provided callback function', () => {
        const callback = () => undefined;

        bt.setOnConnected(callback);

        expect(bt._onConnectCallback).toBe(callback);
      });

      it('should remove the callback when no callback is provided', () => {
        const callback = () => undefined;

        bt.setOnConnected(callback);

        expect(bt._onConnectCallback).toBe(callback);

        bt.setOnConnected();

        expect(bt._onConnectCallback).toBeNull();
      });

      it('should remove the callback when null is explicitly provided', () => {
        const callback = () => undefined;

        bt.setOnConnected(callback);

        expect(bt._onConnectCallback).toBe(callback);

        bt.setOnConnected(null);

        expect(bt._onConnectCallback).toBeNull();
      });

      it('should remove the callback when undefined is explicitly provided', () => {
        const callback = () => undefined;

        bt.setOnConnected(callback);

        expect(bt._onConnectCallback).toBe(callback);

        bt.setOnConnected(undefined);

        expect(bt._onConnectCallback).toBeNull();
      });

      it('should replace the previously set callback', () => {
        const firstCallback = () => undefined;

        bt.setOnConnected(firstCallback);

        expect(bt._onConnectCallback).toBe(firstCallback);

        const secondCallback = () => undefined;

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

      it('should remove the callback when no callback is provided', () => {
        const callback = () => undefined;

        bt.setOnDisconnected(callback);

        expect(bt._onDisconnectCallback).toBe(callback);

        bt.setOnDisconnected();

        expect(bt._onDisconnectCallback).toBeNull();
      });

      it('should remove the callback when null is explicitly provided', () => {
        const callback = () => undefined;

        bt.setOnDisconnected(callback);

        expect(bt._onDisconnectCallback).toBe(callback);

        bt.setOnDisconnected(null);

        expect(bt._onDisconnectCallback).toBeNull();
      });

      it('should remove the callback when undefined is explicitly provided', () => {
        const callback = () => undefined;

        bt.setOnDisconnected(callback);

        expect(bt._onDisconnectCallback).toBe(callback);

        bt.setOnDisconnected(undefined);

        expect(bt._onDisconnectCallback).toBeNull();
      });

      it('should replace the previously set callback', () => {
        const firstCallback = () => undefined;

        bt.setOnDisconnected(firstCallback);

        expect(bt._onDisconnectCallback).toBe(firstCallback);

        const secondCallback = () => undefined;

        bt.setOnDisconnected(secondCallback);

        expect(bt._onDisconnectCallback).toBe(secondCallback);
      });
    });
  });

  describe('Communication', () => {
    describe('When receiving a message...', () => {
      // Using `any` type to access private members for testing purposes. This allows for thorough testing of the
      // internal state and behavior while maintaining strong encapsulation in the production code.
      let bt: any; // eslint-disable-line @typescript-eslint/no-explicit-any

      beforeEach(() => {
        bt = new BluetoothTerminal();
        const device = new DeviceMock('Simon', [0xFFE0]);
        navigator.bluetooth = new WebBluetoothMock([device]);
        jest.spyOn(bt, 'receive');

        return bt.connect();
      });

      it('should not invoke the receive method until the receive separator is received', () => {
        changeCharacteristicValue(bt, 'Hello, world!');

        expect(bt.receive).not.toHaveBeenCalled();
      });

      it('should invoke the receive method when data with the receive separator is received', () => {
        changeCharacteristicValue(bt, 'Hello, world!\n');

        expect(bt.receive).toHaveBeenCalledTimes(1);
        expect(bt.receive).toHaveBeenCalledWith('Hello, world!');
      });

      it('should invoke the receive method when data with multiple receive separators is received', () => {
        changeCharacteristicValue(bt, 'Hello, world!\nCiao, mondo!\n');

        expect(bt.receive).toHaveBeenCalledTimes(2);
        expect(bt.receive).toHaveBeenNthCalledWith(1, 'Hello, world!');
        expect(bt.receive).toHaveBeenNthCalledWith(2, 'Ciao, mondo!');
      });

      it('should invoke the receive method only with the complete message until the receive separator is received',
          () => {
            changeCharacteristicValue(bt, 'Hello, world!\nCiao, mondo!');

            expect(bt.receive).toHaveBeenCalledTimes(1);
            expect(bt.receive).toHaveBeenCalledWith('Hello, world!');
          });
    });
  });
});
