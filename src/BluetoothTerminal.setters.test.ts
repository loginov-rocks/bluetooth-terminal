// Test file uses `require()` style imports because the BluetoothTerminal module is exported only as a CommonJS module.
/* eslint-disable @typescript-eslint/no-require-imports */
const BluetoothTerminal = require('./BluetoothTerminal');

describe('Setters', () => {
  // Using `any` type to access private members for testing purposes. This allows for thorough testing of the internal
  // state and behavior while maintaining strong encapsulation in the production code.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bt: any;

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
  });
});
