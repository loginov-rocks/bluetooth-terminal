// Test file uses `require()` style imports because the BluetoothTerminal module is exported only as a CommonJS module.
/* eslint-disable @typescript-eslint/no-require-imports */
const util = require('util');
const {DeviceMock, WebBluetoothMock} = require('web-bluetooth-mock');

// Import the TextEncoder and TextDecoder from the Node.js util module and add them to the global scope. These are
// natively available in browsers but need to be explicitly added in Node.js test environments. The BluetoothTerminal
// class requires these for encoding/decoding data sent to and received from Bluetooth devices.
global.TextDecoder = util.TextDecoder;
global.TextEncoder = util.TextEncoder;

const BluetoothTerminal = require('./BluetoothTerminal');

describe('Communication', () => {
  // Using `any` type to access private members for testing purposes. This allows for thorough testing of the internal
  // state and behavior while maintaining strong encapsulation in the production code.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bt: any;

  beforeEach(() => {
    bt = new BluetoothTerminal();
  });

  describe('onReceive callback', () => {
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
});
