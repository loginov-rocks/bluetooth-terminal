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

describe('Communication', () => {
  // Using `any` type to access private members for testing purposes. This allows for thorough testing of the internal
  // state and behavior while maintaining strong encapsulation in the production code.
  let bt: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  beforeEach(() => {
    bt = new BluetoothTerminal();
    const device = new DeviceMock('Simon', [0xFFE0]);
    navigator.bluetooth = new WebBluetoothMock([device]);
  });

  describe('When sending a message...', () => {
    it('should send the message with the send separator', async () => {
      await bt.connect();

      jest.spyOn(bt._characteristic, 'writeValue');

      await bt.send('Hello, world!');

      expect(bt._characteristic.writeValue).toHaveBeenCalledTimes(1);
      expect(bt._characteristic.writeValue).toHaveBeenCalledWith(new TextEncoder().encode('Hello, world!\n'));
    });

    it('should send the message longer than the characteristic value size by splitting it into chunks', async () => {
      await bt.connect();

      jest.spyOn(bt._characteristic, 'writeValue');

      await bt.send('This message is longer than the default characteristic value size of 20 chars, so it will be ' +
        'split into 6 chunks');

      expect(bt._characteristic.writeValue).toHaveBeenCalledTimes(6);
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(1,
          new TextEncoder().encode('This message is long'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(2,
          new TextEncoder().encode('er than the default '));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(3,
          new TextEncoder().encode('characteristic value'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(4,
          new TextEncoder().encode(' size of 20 chars, s'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(5,
          new TextEncoder().encode('o it will be split i'));
      expect(bt._characteristic.writeValue).toHaveBeenNthCalledWith(6, new TextEncoder().encode('nto 6 chunks\n'));
    });

    it('should throw an error when no message is provided', () => {
      return expect(bt.send()).rejects.toThrow();
    });

    it('should throw an error when an empty string is provided', () => {
      return expect(bt.send('')).rejects.toThrow();
    });

    it('should throw an error when no device is connected', () => {
      return expect(bt.send('Hello, world!')).rejects.toThrow();
    });

    it('should throw an error when the device disconnects while sending the long message', async () => {
      await bt.connect();

      jest.spyOn(bt._characteristic, 'writeValue');

      const promise = bt.send('This message is longer than the default characteristic value size of 20 chars');

      expect(bt._characteristic.writeValue).toHaveBeenCalledTimes(1);
      expect(bt._characteristic.writeValue).toHaveBeenCalledWith(new TextEncoder().encode('This message is long'));

      // Disconnect the device while sending the long message split into chunks before the Promise resolves. This tests
      // the error handling when the connection is lost after the first chunk is sent, but before the remaining chunks
      // can be sent.
      bt.disconnect();

      await expect(promise).rejects.toThrow();
    });
  });

  describe('When receiving a message...', () => {
    let onReceiveCallback: jest.Func;

    beforeEach(() => {
      onReceiveCallback = jest.fn();
      bt.onReceive(onReceiveCallback);

      return bt.connect();
    });

    it('should not invoke the onReceive callback until the receive separator is received', () => {
      changeCharacteristicValue(bt, 'Hello, world!');

      expect(onReceiveCallback).not.toHaveBeenCalled();
    });

    it('should invoke the onReceive callback when data with the receive separator is received', () => {
      changeCharacteristicValue(bt, 'Hello, world!\n');

      expect(onReceiveCallback).toHaveBeenCalledTimes(1);
      expect(onReceiveCallback).toHaveBeenCalledWith('Hello, world!');
    });

    it('should invoke the onReceive callback when data with multiple receive separators is received', () => {
      changeCharacteristicValue(bt, 'Hello, world!\nCiao, mondo!\n');

      expect(onReceiveCallback).toHaveBeenCalledTimes(2);
      expect(onReceiveCallback).toHaveBeenNthCalledWith(1, 'Hello, world!');
      expect(onReceiveCallback).toHaveBeenNthCalledWith(2, 'Ciao, mondo!');
    });

    it('should invoke the onReceive callback only with the complete message until the receive separator is received',
        () => {
          changeCharacteristicValue(bt, 'Hello, world!\nCiao, mondo!');

          expect(onReceiveCallback).toHaveBeenCalledTimes(1);
          expect(onReceiveCallback).toHaveBeenCalledWith('Hello, world!');
        });
  });
});
