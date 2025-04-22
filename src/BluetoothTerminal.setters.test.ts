// Test file uses `require()` style imports because the BluetoothTerminal module is exported only as a CommonJS module.
/* eslint-disable @typescript-eslint/no-require-imports */
const BluetoothTerminal = require('./BluetoothTerminal');

describe('Setters', () => {
  // Using `any` type to access private members for testing purposes. This allows for thorough testing of the internal
  // state and behavior while maintaining strong encapsulation in the production code.
  let bt: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  beforeEach(() => {
    bt = new BluetoothTerminal();
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

    it('should throw an error when a non-integer and non-string value is provided', () => {
      expect(() => {
        bt.setServiceUuid(NaN);
      }).toThrow('Service UUID must be either an integer or a string');
    });

    it('should throw an error when zero is provided', () => {
      expect(() => {
        bt.setServiceUuid(0);
      }).toThrow('Service UUID cannot be zero');
    });

    it('should throw an error when an empty string is provided', () => {
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

    it('should throw an error when a non-integer and non-string value is provided', () => {
      expect(() => {
        bt.setCharacteristicUuid(NaN);
      }).toThrow('Characteristic UUID must be either an integer or a string');
    });

    it('should throw an error when zero is provided', () => {
      expect(() => {
        bt.setCharacteristicUuid(0);
      }).toThrow('Characteristic UUID cannot be zero');
    });

    it('should throw an error when an empty string is provided', () => {
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

    it('should throw an error when a non-integer value is provided', () => {
      expect(() => {
        bt.setCharacteristicValueSize(NaN);
      }).toThrow('Characteristic value size must be a positive integer');
    });

    it('should throw an error when zero is provided', () => {
      expect(() => {
        bt.setCharacteristicValueSize(0);
      }).toThrow('Characteristic value size must be a positive integer');
    });

    it('should throw an error when a negative integer is provided', () => {
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

    it('should throw an error when a non-string value is provided', () => {
      expect(() => {
        bt.setReceiveSeparator(42);
      }).toThrow('Receive separator must be a string');
    });

    it('should throw an error when a multi-character string is provided', () => {
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

    it('should throw an error when a non-string value is provided', () => {
      expect(() => {
        bt.setSendSeparator(42);
      }).toThrow('Send separator must be a string');
    });

    it('should throw an error when a multi-character string is provided', () => {
      expect(() => {
        bt.setSendSeparator('\r\n');
      }).toThrow('Send separator length must be equal to one character');
    });
  });

  describe('onConnect', () => {
    it('should store the provided callback function', () => {
      const callback = () => undefined;

      bt.onConnect(callback);

      expect(bt._onConnectCallback).toBe(callback);
    });

    it('should remove the callback when no callback is provided', () => {
      const callback = () => undefined;

      bt.onConnect(callback);

      expect(bt._onConnectCallback).toBe(callback);

      bt.onConnect();

      expect(bt._onConnectCallback).toBeNull();
    });

    it('should remove the callback when null is explicitly provided', () => {
      const callback = () => undefined;

      bt.onConnect(callback);

      expect(bt._onConnectCallback).toBe(callback);

      bt.onConnect(null);

      expect(bt._onConnectCallback).toBeNull();
    });

    it('should remove the callback when undefined is explicitly provided', () => {
      const callback = () => undefined;

      bt.onConnect(callback);

      expect(bt._onConnectCallback).toBe(callback);

      bt.onConnect(undefined);

      expect(bt._onConnectCallback).toBeNull();
    });

    it('should replace the previously set callback', () => {
      const firstCallback = () => undefined;

      bt.onConnect(firstCallback);

      expect(bt._onConnectCallback).toBe(firstCallback);

      const secondCallback = () => undefined;

      bt.onConnect(secondCallback);

      expect(bt._onConnectCallback).toBe(secondCallback);
    });
  });

  describe('onDisconnect', () => {
    it('should store the provided callback function', () => {
      const callback = () => undefined;

      bt.onDisconnect(callback);

      expect(bt._onDisconnectCallback).toBe(callback);
    });

    it('should remove the callback when no callback is provided', () => {
      const callback = () => undefined;

      bt.onDisconnect(callback);

      expect(bt._onDisconnectCallback).toBe(callback);

      bt.onDisconnect();

      expect(bt._onDisconnectCallback).toBeNull();
    });

    it('should remove the callback when null is explicitly provided', () => {
      const callback = () => undefined;

      bt.onDisconnect(callback);

      expect(bt._onDisconnectCallback).toBe(callback);

      bt.onDisconnect(null);

      expect(bt._onDisconnectCallback).toBeNull();
    });

    it('should remove the callback when undefined is explicitly provided', () => {
      const callback = () => undefined;

      bt.onDisconnect(callback);

      expect(bt._onDisconnectCallback).toBe(callback);

      bt.onDisconnect(undefined);

      expect(bt._onDisconnectCallback).toBeNull();
    });

    it('should replace the previously set callback', () => {
      const firstCallback = () => undefined;

      bt.onDisconnect(firstCallback);

      expect(bt._onDisconnectCallback).toBe(firstCallback);

      const secondCallback = () => undefined;

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

    it('should remove the callback when no callback is provided', () => {
      const callback = () => undefined;

      bt.onReceive(callback);

      expect(bt._onReceiveCallback).toBe(callback);

      bt.onReceive();

      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should remove the callback when null is explicitly provided', () => {
      const callback = () => undefined;

      bt.onReceive(callback);

      expect(bt._onReceiveCallback).toBe(callback);

      bt.onReceive(null);

      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should remove the callback when undefined is explicitly provided', () => {
      const callback = () => undefined;

      bt.onReceive(callback);

      expect(bt._onReceiveCallback).toBe(callback);

      bt.onReceive(undefined);

      expect(bt._onReceiveCallback).toBeNull();
    });

    it('should replace the previously set callback', () => {
      const firstCallback = () => undefined;

      bt.onReceive(firstCallback);

      expect(bt._onReceiveCallback).toBe(firstCallback);

      const secondCallback = () => undefined;

      bt.onReceive(secondCallback);

      expect(bt._onReceiveCallback).toBe(secondCallback);
    });
  });

  describe('onLog', () => {
    it('should store the provided callback function', () => {
      const callback = () => undefined;

      bt.onLog(callback);

      expect(bt._onLogCallback).toBe(callback);
    });

    it('should remove the callback when no callback is provided', () => {
      const callback = () => undefined;

      bt.onLog(callback);

      expect(bt._onLogCallback).toBe(callback);

      bt.onLog();

      expect(bt._onLogCallback).toBeNull();
    });

    it('should remove the callback when null is explicitly provided', () => {
      const callback = () => undefined;

      bt.onLog(callback);

      expect(bt._onLogCallback).toBe(callback);

      bt.onLog(null);

      expect(bt._onLogCallback).toBeNull();
    });

    it('should remove the callback when undefined is explicitly provided', () => {
      const callback = () => undefined;

      bt.onLog(callback);

      expect(bt._onLogCallback).toBe(callback);

      bt.onLog(undefined);

      expect(bt._onLogCallback).toBeNull();
    });

    it('should replace the previously set callback', () => {
      const firstCallback = () => undefined;

      bt.onLog(firstCallback);

      expect(bt._onLogCallback).toBe(firstCallback);

      const secondCallback = () => undefined;

      bt.onLog(secondCallback);

      expect(bt._onLogCallback).toBe(secondCallback);
    });
  });

  describe('setLogLevel', () => {
    it('should accept and store all valid log levels', () => {
      const logLevels = ['none', 'error', 'warn', 'info', 'log', 'debug'];

      for (const logLevel of logLevels) {
        bt.setLogLevel(logLevel);

        expect(bt._logLevel).toBe(logLevel);
      }
    });

    it('should throw an error when a non-string value is provided', () => {
      expect(() => {
        bt.setLogLevel(42);
      }).toThrow('Log level must be a string');
    });

    it('should throw an error when an unknown log level is provided', () => {
      expect(() => {
        bt.setLogLevel('unknown');
      }).toThrow('Log level must be one of: "none", "error", "warn", "info", "log", "debug"');
    });
  });
});
