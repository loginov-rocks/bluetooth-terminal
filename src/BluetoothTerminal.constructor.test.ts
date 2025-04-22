// Test file uses `require()` style imports because the BluetoothTerminal module is exported only as a CommonJS module.
/* eslint-disable @typescript-eslint/no-require-imports */
const BluetoothTerminal = require('./BluetoothTerminal');

describe('Constructor', () => {
  it('should initialize with the default configuration when no object is provided', () => {
    const bt = new BluetoothTerminal();

    expect(bt._serviceUuid).toBe(0xFFE0);
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

  it('should initialize with the default configuration when an empty object is provided', () => {
    const bt = new BluetoothTerminal({});

    expect(bt._serviceUuid).toBe(0xFFE0);
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

  it('should accept and store a custom integer service UUID while keeping the rest of the default configuration',
      () => {
        const bt = new BluetoothTerminal({serviceUuid: 1234});

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

  it('should accept and store a custom string service UUID while keeping the rest of the default configuration', () => {
    const bt = new BluetoothTerminal({serviceUuid: '00001818-0000-1000-8000-00805f9b34fb'});

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

  it('should accept and store a custom integer characteristic UUID while keeping the rest of the default configuration',
      () => {
        const bt = new BluetoothTerminal({characteristicUuid: 1234});

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

  it('should accept and store a custom string characteristic UUID while keeping the rest of the default configuration',
      () => {
        const bt = new BluetoothTerminal({characteristicUuid: '00001818-0000-1000-8000-00805f9b34fb'});

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

  it('should accept and store a custom characteristic value size while keeping the rest of the default configuration',
      () => {
        const bt = new BluetoothTerminal({characteristicValueSize: 40});

        expect(bt._serviceUuid).toBe(0xFFE0);
        expect(bt._characteristicUuid).toBe(0xFFE1);
        expect(bt._characteristicValueSize).toBe(40);
        expect(bt._receiveSeparator).toBe('\n');
        expect(bt._sendSeparator).toBe('\n');
        expect(bt._onConnectCallback).toBeNull();
        expect(bt._onDisconnectCallback).toBeNull();
        expect(bt._onReceiveCallback).toBeNull();
        expect(bt._onLogCallback).toBeNull();
        expect(bt._logLevel).toBe('log');
      });

  it('should accept and store a custom receive separator while keeping the rest of the default configuration', () => {
    const bt = new BluetoothTerminal({receiveSeparator: ';'});

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
    const bt = new BluetoothTerminal({sendSeparator: ';'});

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

  it('should accept and store a custom onConnect callback while keeping the rest of the default configuration', () => {
    const callback = () => undefined;

    const bt = new BluetoothTerminal({onConnectCallback: callback});

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

        const bt = new BluetoothTerminal({onDisconnectCallback: callback});

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

  it('should accept and store a custom onReceive callback while keeping the rest of the default configuration', () => {
    const callback = () => undefined;

    const bt = new BluetoothTerminal({onReceiveCallback: callback});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBe(callback);
    expect(bt._onLogCallback).toBeNull();
    expect(bt._logLevel).toBe('log');
  });

  it('should accept and store a custom onLog callback while keeping the rest of the default configuration', () => {
    const callback = () => undefined;

    const bt = new BluetoothTerminal({onLogCallback: callback});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
    expect(bt._onLogCallback).toBe(callback);
    expect(bt._logLevel).toBe('log');
  });

  it('should accept and store the log level while keeping the rest of the default configuration', () => {
    const bt = new BluetoothTerminal({logLevel: 'debug'});

    expect(bt._serviceUuid).toBe(0xFFE0);
    expect(bt._characteristicUuid).toBe(0xFFE1);
    expect(bt._characteristicValueSize).toBe(20);
    expect(bt._receiveSeparator).toBe('\n');
    expect(bt._sendSeparator).toBe('\n');
    expect(bt._onConnectCallback).toBeNull();
    expect(bt._onDisconnectCallback).toBeNull();
    expect(bt._onReceiveCallback).toBeNull();
    expect(bt._onLogCallback).toBeNull();
    expect(bt._logLevel).toBe('debug');
  });

  it('should accept and store all custom parameters provided', () => {
    const firstCallback = () => undefined;
    const secondCallback = () => undefined;
    const thirdCallback = () => undefined;
    const fourthCallback = () => undefined;

    const bt = new BluetoothTerminal({
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
    });

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
});
