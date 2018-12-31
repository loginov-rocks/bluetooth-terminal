'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {JSDOM} = require('jsdom');
const sinon = require('sinon');
const {TextDecoder, TextEncoder} = require('util');
const {DeviceMock, WebBluetoothMock} = require('web-bluetooth-mock');

const BluetoothTerminal = require('../src/BluetoothTerminal');

chai.use(chaiAsPromised);

const {assert} = chai;

// Provide testing environment with `window` object to support DOM events and
// with `navigator` to spy for bluetooth features.
global.window = new JSDOM('').window;
global.navigator = window.navigator;

// Use node text encoding features from `util` module.
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

describe('BluetoothTerminal', () => {
  let bt;

  // Create new instance before each test.
  beforeEach(() => {
    bt = new BluetoothTerminal();
  });

  describe('setServiceUuid', () => {
    it('should set number', () => {
      const value = 0x1234;
      bt.setServiceUuid(value);
      assert.strictEqual(bt._serviceUuid, value);
    });

    it('should set string', () => {
      const value = '1234';
      bt.setServiceUuid(value);
      assert.strictEqual(bt._serviceUuid, value);
    });

    it('should throw an error if value is neither a number nor a string',
        () => {
          assert.throws(() => {
            bt.setServiceUuid(NaN);
          });
        });

    it('should throw an error if value is 0', () => {
      assert.throws(() => {
        bt.setServiceUuid(0);
      });
    });
  });

  describe('setCharacteristicUuid', () => {
    it('should set number', () => {
      const value = 0x1234;
      bt.setCharacteristicUuid(value);
      assert.strictEqual(bt._characteristicUuid, value);
    });

    it('should set string', () => {
      const value = '1234';
      bt.setCharacteristicUuid(value);
      assert.strictEqual(bt._characteristicUuid, value);
    });

    it('should throw an error if value is neither a number nor a string',
        () => {
          assert.throws(() => {
            bt.setCharacteristicUuid(NaN);
          });
        });

    it('should throw an error if value is 0', () => {
      assert.throws(() => {
        bt.setCharacteristicUuid(0);
      });
    });
  });

  describe('setReceiveSeparator', () => {
    it('should set string', () => {
      const value = '\n';
      bt.setReceiveSeparator(value);
      assert.strictEqual(bt._receiveSeparator, value);
    });

    it('should throw an error if value is not a string', () => {
      assert.throws(() => {
        bt.setReceiveSeparator(42);
      });
    });

    it('should throw an error if value length is more than one character',
        () => {
          assert.throws(() => {
            bt.setReceiveSeparator('\r\n');
          });
        });
  });

  describe('setSendSeparator', () => {
    it('should set string', () => {
      const value = '\n';
      bt.setSendSeparator(value);
      assert.strictEqual(bt._receiveSeparator, value);
    });

    it('should throw an error if value is not a string', () => {
      assert.throws(() => {
        bt.setSendSeparator(42);
      });
    });

    it('should throw an error if value length is more than one character',
        () => {
          assert.throws(() => {
            bt.setSendSeparator('\r\n');
          });
        });
  });

  describe('connect', () => {
    it('should connect', () => {
      const device = new DeviceMock('Simon', [bt._serviceUuid]);
      navigator.bluetooth = new WebBluetoothMock([device]);

      return assert.isFulfilled(bt.connect());
    });

    it('should connect the second time to cached device', () => {
      const device = new DeviceMock('Simon', [bt._serviceUuid]);
      navigator.bluetooth = new WebBluetoothMock([device]);

      const requestDeviceSpy = sinon.spy(navigator.bluetooth, 'requestDevice');

      return bt.connect().
          then(() => bt.connect()).
          then(() => assert(requestDeviceSpy.calledOnce));
    });

    it('should not connect if device not found', () => {
      const device = new DeviceMock('Simon', [bt._serviceUuid + 42]);
      navigator.bluetooth = new WebBluetoothMock([device]);

      return assert.isRejected(bt.connect());
    });
  });

  describe('disconnect', () => {
    let connectPromise;
    let device;
    let disconnectSpy;

    // Connect to the device and set up the spy before each test.
    beforeEach(() => {
      device = new DeviceMock('Simon', [bt._serviceUuid]);
      navigator.bluetooth = new WebBluetoothMock([device]);
      connectPromise = bt.connect();
      disconnectSpy = sinon.spy(device.gatt, 'disconnect');
    });

    it('should disconnect once', () => {
      return connectPromise.
          then(() => {
            bt.disconnect();
            bt.disconnect(); // Second call should not fire disconnect method.
            return assert(disconnectSpy.calledOnce);
          });
    });

    it('should not call `device.gatt.disconnect` if is already disconnected',
        () => {
          return connectPromise.
              then(() => {
                // Hard mock used here to cover the case.
                bt._device.gatt.connected = false;
                bt.disconnect();
                return assert(disconnectSpy.notCalled);
              });
        });
  });

  describe('receive', () => {
    const characteristicValueChangedEvent = new window.
        CustomEvent('characteristicvaluechanged');
    let connectPromise;
    let receiveSpy;

    // Connect to the device and set up the spy before each test.
    beforeEach(() => {
      const device = new DeviceMock('Simon', [bt._serviceUuid]);
      navigator.bluetooth = new WebBluetoothMock([device]);
      connectPromise = bt.connect();
      receiveSpy = sinon.spy(bt, 'receive');
    });

    it('should not be called when a value provided does not have a separator',
        () => {
          const value = 'Hello, world!';

          return connectPromise.
              then(() => {
                const characteristic = bt._characteristic;

                characteristic.value = new TextEncoder().encode(value);
                characteristic.dispatchEvent(characteristicValueChangedEvent);

                return assert(receiveSpy.notCalled);
              });
        });

    it('should be called when a value provided have a separator', () => {
      const value = 'Hello, world!' + bt._receiveSeparator;

      return connectPromise.
          then(() => {
            const characteristic = bt._characteristic;

            characteristic.value = new TextEncoder().encode(value);
            characteristic.dispatchEvent(characteristicValueChangedEvent);

            return assert(receiveSpy.calledOnce);
          });
    });

    it('should be called twice when a value provided have three separators, ' +
        'but there is no data data between the first and second', () => {
      const value = 'Hello, world!' + bt._receiveSeparator +
          bt._receiveSeparator + 'Ciao, mondo!' + bt._receiveSeparator;

      return connectPromise.
          then(() => {
            const characteristic = bt._characteristic;

            characteristic.value = new TextEncoder().encode(value);
            characteristic.dispatchEvent(characteristicValueChangedEvent);

            return assert(receiveSpy.calledTwice);
          });
    });
  });

  describe('send', () => {
    // Set up Web Bluetooth mock before each test.
    beforeEach(() => {
      const device = new DeviceMock('Simon', [bt._serviceUuid]);
      navigator.bluetooth = new WebBluetoothMock([device]);
    });

    it('should reject empty data', () => {
      return assert.isRejected(bt.send());
    });

    it('should reject if not connected', () => {
      return assert.isRejected(bt.send('Hello, world!'));
    });

    it('should write to characteristic', () => {
      let writeValueSpy;

      return bt.connect().
          then(() => {
            writeValueSpy = sinon.spy(bt._characteristic, 'writeValue');
            return bt.send('Hello, world!');
          }).
          then(() => assert(writeValueSpy.calledOnce));
    });

    it('should write long data to characteristic consistently', () => {
      let writeValueSpy;
      let data = '';

      while (data.length <= bt._maxCharacteristicValueLength) {
        data += 'Hello, world!';
      }

      return bt.connect().
          then(() => {
            writeValueSpy = sinon.spy(bt._characteristic, 'writeValue');
            return bt.send(data);
          }).
          then(() => assert.strictEqual(writeValueSpy.callCount,
              Math.ceil(data.length / bt._maxCharacteristicValueLength)));
    });

    it('should reject if device suddenly disconnects', () => {
      let writeValueSpy;
      let data = '';

      while (data.length <= bt._maxCharacteristicValueLength) {
        data += 'Hello, world!';
      }

      return bt.connect().
          then(() => {
            writeValueSpy = sinon.spy(bt._characteristic, 'writeValue');
            bt.send(data);
            bt.disconnect();
          }).
          then(() => assert(writeValueSpy.calledOnce));
    });
  });

  describe('getDeviceName', () => {
    // Set up Web Bluetooth mock before each test.
    beforeEach(() => {
      const device = new DeviceMock('Simon', [bt._serviceUuid]);
      navigator.bluetooth = new WebBluetoothMock([device]);
    });

    it('should return empty string if not connected', () => {
      assert.strictEqual(bt.getDeviceName(), '');
    });

    it('should return device name', () => {
      const value = 'Simon';

      return bt.connect().
          then(() => assert.strictEqual(bt.getDeviceName(), value));
    });
  });

  describe('_stopNotifications', () => {
    const characteristicValueChangedEvent = new window.
        CustomEvent('characteristicvaluechanged');
    let connectPromise;
    let receiveSpy;

    // Connect to the device and set up the spy before each test.
    beforeEach(() => {
      const device = new DeviceMock('Simon', [bt._serviceUuid]);
      navigator.bluetooth = new WebBluetoothMock([device]);
      connectPromise = bt.connect();
      receiveSpy = sinon.spy(bt, 'receive');
    });

    it('should stop data receiving', () => {
      const value = 'Hello, world!' + bt._receiveSeparator;

      let characteristic;

      return connectPromise.
          then(() => {
            characteristic = bt._characteristic;

            characteristic.value = new TextEncoder().encode(value);
            characteristic.dispatchEvent(characteristicValueChangedEvent);

            return assert(receiveSpy.calledOnce);
          }).
          then(() => {
            // Call for private method only to test it.
            return bt._stopNotifications(bt._characteristic);
          }).
          then(() => {
            characteristic.value = new TextEncoder().encode(value);
            characteristic.dispatchEvent(characteristicValueChangedEvent);

            return assert(receiveSpy.calledOnce); // Remains the same.
          });
    });
  });

  describe('_handleDisconnection', () => {
    let connectDeviceAndCacheCharacteristicSpy;
    let connectPromise;
    let device;
    const gattServerDisconnectedEvent = new window.
        CustomEvent('gattserverdisconnected');

    // Set up Web Bluetooth mock before each test.
    beforeEach(() => {
      device = new DeviceMock('Simon', [bt._serviceUuid]);
      navigator.bluetooth = new WebBluetoothMock([device]);
      connectDeviceAndCacheCharacteristicSpy = sinon.spy(bt,
          '_connectDeviceAndCacheCharacteristic');
      connectPromise = bt.connect();
    });

    it('should reconnect', () => {
      return connectPromise.
          then(() => {
            return assert(connectDeviceAndCacheCharacteristicSpy.calledOnce);
          }).
          then(() => {
            device.dispatchEvent(gattServerDisconnectedEvent);
          }).
          then(() => {
            return assert(connectDeviceAndCacheCharacteristicSpy.calledTwice);
          });
    });

    it('should fail to reconnect and call `log` with the error', (done) => {
      const error = 'Simulated error';
      const logSpy = sinon.spy(bt, '_log');

      connectPromise.
          then(() => {
            return assert(connectDeviceAndCacheCharacteristicSpy.calledOnce);
          }).
          then(() => {
            // Simulate disconnection.
            device.gatt.connected = false;
            device.gatt.connect = () => Promise.reject(error);
            device.dispatchEvent(gattServerDisconnectedEvent);
          }).
          then(() => {
            // Make sure the assert will be executed after the promise.
            setTimeout(() => {
              assert(logSpy.lastCall.calledWith(error));
              done();
            }, 0);

            return assert(connectDeviceAndCacheCharacteristicSpy.calledTwice);
          });
    });
  });

  describe('_splitByLength', () => {
    it('should split string shorter than specified length to one chunk', () => {
      assert.equal(bt.constructor._splitByLength('abcde', 6).length, 1);
    });

    it('should split string aliquant to specified length', () => {
      assert.equal(bt.constructor._splitByLength('abcde', 2).length, 3);
    });

    it('should split string with carriage return', () => {
      assert.equal(bt.constructor._splitByLength('a\rbcde', 3).length, 2);
    });

    it('should split string with line feed', () => {
      assert.equal(bt.constructor._splitByLength('abcd\ne', 3).length, 2);
    });
  });
});
