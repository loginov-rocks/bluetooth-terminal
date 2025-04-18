// Test file uses `require()` style imports because the BluetoothTerminal module is exported only as a CommonJS module.
/* eslint-disable @typescript-eslint/no-require-imports */
const {DeviceMock, WebBluetoothMock} = require('web-bluetooth-mock');

const BluetoothTerminal = require('./BluetoothTerminal');

describe('Connection', () => {
  // Using `any` type to access private members for testing purposes. This allows for thorough testing of the internal
  // state and behavior while maintaining strong encapsulation in the production code.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bt: any;

  beforeEach(() => {
    bt = new BluetoothTerminal();
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
        expect(bt._logError).toHaveBeenLastCalledWith('_gattServerDisconnectedListener', new Error('Simulated error'),
            expect.any(Function));
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
