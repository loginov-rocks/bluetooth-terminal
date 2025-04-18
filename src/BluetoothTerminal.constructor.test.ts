// Test file uses `require()` style imports because the BluetoothTerminal module is exported only as a CommonJS module.
/* eslint-disable @typescript-eslint/no-require-imports */
const BluetoothTerminal = require('./BluetoothTerminal');

describe('Constructor', () => {
  it('should initialize with default values when no parameters are provided', () => {
    const bt = new BluetoothTerminal();

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
    const bt = new BluetoothTerminal({});

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
    const bt = new BluetoothTerminal({serviceUuid: 1234});

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
    const bt = new BluetoothTerminal({serviceUuid: '00001818-0000-1000-8000-00805f9b34fb'});

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
    const bt = new BluetoothTerminal({characteristicUuid: 1234});

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
    const bt = new BluetoothTerminal({characteristicUuid: '00001818-0000-1000-8000-00805f9b34fb'});

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
    const bt = new BluetoothTerminal({characteristicValueSize: 40});

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
    const bt = new BluetoothTerminal({receiveSeparator: ';'});

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
    const bt = new BluetoothTerminal({sendSeparator: ';'});

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
    const bt = new BluetoothTerminal({onConnectCallback: callback});

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
    const bt = new BluetoothTerminal({onDisconnectCallback: callback});

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
    const bt = new BluetoothTerminal({onReceiveCallback: callback});

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
    const bt = new BluetoothTerminal({
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
});
