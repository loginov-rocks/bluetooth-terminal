const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const path = require('path');
const sinon = require('sinon');
const {DeviceMock, WebBluetoothMock} = require('web-bluetooth-mock');

chai.use(chaiAsPromised);

const {assert} = chai;
const BluetoothTerminal = require(path.join(__dirname, '..',
    'BluetoothTerminal'));

global.navigator = global.navigator || {};

describe('BluetoothTerminal', () => {
  let bt;

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

  describe('setSendDelay', () => {
    it('should set number', () => {
      const value = 42;
      bt.setSendDelay(value);
      assert.strictEqual(bt._sendDelay, value);
    });

    it('should throw an error if value is not a number', () => {
      assert.throws(() => {
        bt.setSendDelay(NaN);
      });
    });

    it('should throw an error if value is less than zero', () => {
      assert.throws(() => {
        bt.setSendDelay(-42);
      });
    });
  });

  describe('connect', () => {
    it('should connect', () => {
      const device = new DeviceMock('Simon', [bt._serviceUuid]);
      global.navigator.bluetooth = new WebBluetoothMock([device]);

      return assert.isFulfilled(bt.connect());
    });

    it('should connect the second time to cached device', () => {
      const device = new DeviceMock('Simon', [bt._serviceUuid]);
      global.navigator.bluetooth = new WebBluetoothMock([device]);

      const requestDeviceSpy = sinon.spy(global.navigator.bluetooth,
          'requestDevice');

      return bt.connect().
          then(() => bt.connect()).
          then(() => {
            assert(requestDeviceSpy.calledOnce);
          });
    });

    it('should not connect if device not found', () => {
      const device = new DeviceMock('Simon', [bt._serviceUuid + 42]);
      global.navigator.bluetooth = new WebBluetoothMock([device]);

      return assert.isRejected(bt.connect());
    });
  });

  describe('disconnect', () => {
    it('should disconnect once', () => {
      const device = new DeviceMock('Simon', [bt._serviceUuid]);
      global.navigator.bluetooth = new WebBluetoothMock([device]);

      const disconnectSpy = sinon.spy(device.gatt, 'disconnect');

      return bt.connect().
          then(() => {
            bt.disconnect();
            bt.disconnect(); // Second call should not fire disconnect method
            assert(disconnectSpy.calledOnce);
          });
    });

    it('should not call `device.gatt.disconnect` if is already disconnected',
        () => {
          const device = new DeviceMock('Simon', [bt._serviceUuid]);
          global.navigator.bluetooth = new WebBluetoothMock([device]);

          const disconnectSpy = sinon.spy(device.gatt, 'disconnect');

          return bt.connect().
              then(() => {
                // Hard mock used here to cover the case
                bt._device.gatt.connected = false;
                bt.disconnect();
                assert(disconnectSpy.notCalled);
              });
        });
  });

  describe('_splitByLength', function() {
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
