const assert = require('assert');
const path = require('path');

const BluetoothTerminal = require(path.join(__dirname, '..',
    'BluetoothTerminal'));

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

    it('should throw an error if value is null', () => {
      assert.throws(() => {
        bt.setServiceUuid(null);
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

    it('should throw an error if value is null', () => {
      assert.throws(() => {
        bt.setCharacteristicUuid(null);
      });
    });
  });

  describe('splitByLength', function() {
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
