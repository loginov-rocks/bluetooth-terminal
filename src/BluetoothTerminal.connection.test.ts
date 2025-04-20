// Test file uses `require()` style imports because the BluetoothTerminal module is exported only as a CommonJS module.
/* eslint-disable @typescript-eslint/no-require-imports */
const {DeviceMock, WebBluetoothMock} = require('web-bluetooth-mock');

const BluetoothTerminal = require('./BluetoothTerminal');

const unexpectedlyDisconnect = (device: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  // Simulate an unexpected disconnection by dispatching the corresponding Web Bluetooth API event.
  device.dispatchEvent(new CustomEvent('gattserverdisconnected'));
};

describe('Connection', () => {
  // Using `any` type to access private members for testing purposes. This allows for thorough testing of the internal
  // state and behavior while maintaining strong encapsulation in the production code.
  let bt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  let device: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  beforeEach(() => {
    bt = new BluetoothTerminal();
    device = new DeviceMock('Simon', [0xFFE0]);
    navigator.bluetooth = new WebBluetoothMock([device]);
  });

  describe('When connecting to the device...', () => {
    beforeEach(() => {
      jest.spyOn(navigator.bluetooth, 'requestDevice');
      jest.spyOn(device.gatt, 'connect');
    });

    it('should open the browser Bluetooth device picker and connect to the selected device', async () => {
      await expect(bt.connect()).resolves.toBeUndefined();
      expect(navigator.bluetooth.requestDevice).toHaveBeenCalledTimes(1);
      expect(device.gatt.connect).toHaveBeenCalledTimes(1);
    });

    it('should connect to the previously selected device on subsequent calls to avoid prompting the user multiple ' +
      'times', async () => {
      // The first connection should open the browser Bluetooth device picker.
      await expect(bt.connect()).resolves.toBeUndefined();
      // The second connection should connect to the previously selected device.
      await expect(bt.connect()).resolves.toBeUndefined();
      expect(navigator.bluetooth.requestDevice).toHaveBeenCalledTimes(1);
      expect(device.gatt.connect).toHaveBeenCalledTimes(2);
    });

    it('should invoke the onConnect callback after connection', async () => {
      const callback = jest.fn();
      bt.onConnect(callback);

      await expect(bt.connect()).resolves.toBeUndefined();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when no device with a matching service UUID is available', async () => {
      device = new DeviceMock('Simon', [1234]);
      navigator.bluetooth = new WebBluetoothMock([device]);
      jest.spyOn(navigator.bluetooth, 'requestDevice');

      await expect(bt.connect()).rejects.toThrow();
      expect(navigator.bluetooth.requestDevice).toHaveBeenCalledTimes(1);
    });
  });

  describe('When disconnecting from the device...', () => {
    beforeEach(() => {
      jest.spyOn(device.gatt, 'disconnect');

      return bt.connect();
    });

    it('should disconnect only once despite subsequent calls', () => {
      bt.disconnect();
      bt.disconnect(); // The second call shouldn't trigger another disconnect.

      expect(device.gatt.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should invoke the onDisconnect callback after disconnection', () => {
      const callback = jest.fn();
      bt.onDisconnect(callback);

      bt.disconnect();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should avoid disconnecting when the device unexpectedly disconnects', () => {
      // Simulate an unexpected disconnection by setting the Web Bluetooth API connection flag.
      device.gatt.connected = false;

      bt.disconnect();

      expect(device.gatt.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('When the device unexpectedly disconnects...', () => {
    beforeEach(() => {
      jest.spyOn(device.gatt, 'connect');

      return bt.connect();
    });

    it('should invoke the onDisconnect callback', () => {
      const callback = jest.fn();
      bt.onDisconnect(callback);

      unexpectedlyDisconnect(device);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should attempt to reconnect to the device', () => {
      // Verify that connect was already called once during test setup.
      expect(device.gatt.connect).toHaveBeenCalledTimes(1);

      unexpectedlyDisconnect(device);

      // Verify that a reconnection attempt was made.
      expect(device.gatt.connect).toHaveBeenCalledTimes(2);
    });

    it('should invoke the onConnect callback after reconnection', (done) => {
      const callback = jest.fn();
      bt.onConnect(callback);

      unexpectedlyDisconnect(device);

      // Using `setTimeout()` to defer verification until after the current call stack has completed. This allows the
      // reconnection Promise chain to resolve before checking if the onConnect callback was triggered. Without this,
      // the check can happen before the async reconnection process finishes.
      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        // Signal Jest that the asynchronous test is complete.
        done();
      }, 0);
    });

    it('should log an error when a reconnection attempt fails', (done) => {
      jest.spyOn(bt, '_logError');

      // Verify that connect was already called once during test setup.
      expect(device.gatt.connect).toHaveBeenCalledTimes(1);

      // Mock the connect method to simulate a connection failure.
      device.gatt.connect = jest.fn(() => Promise.reject(new Error('Simulated error')));

      unexpectedlyDisconnect(device);

      // Verify that a reconnection attempt was made. Using `1` since the connect method was just mocked.
      expect(device.gatt.connect).toHaveBeenCalledTimes(1);

      // Using `setTimeout()` to wait for the Promise rejection to be processed. This allows for verifying asynchronous
      // behavior after the reconnection failure.
      setTimeout(() => {
        // Verify that the error was properly logged.
        expect(bt._logError).toHaveBeenLastCalledWith(
            '_gattServerDisconnectedListener',
            new Error('Simulated error'),
            expect.any(Function),
        );
        // Signal Jest that the asynchronous test is complete.
        done();
      }, 0);
    });
  });

  describe('When getting the device name...', () => {
    it('should return an empty string when no device is connected', () => {
      expect(bt.getDeviceName()).toBe('');
    });

    it('should return the device name after connection', async () => {
      await bt.connect();

      expect(bt.getDeviceName()).toBe('Simon');
    });

    it('should return the device name when the device unexpectedly disconnects', async () => {
      await bt.connect();

      // Simulate an unexpected disconnection by setting the Web Bluetooth API connection flag.
      device.gatt.connected = false;

      expect(bt.getDeviceName()).toBe('Simon');
    });
  });
});
