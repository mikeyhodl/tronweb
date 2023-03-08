const TronWeb = require('../setup/TronWeb');
const ethers = require('ethers');
const BigNumber = require('bignumber.js');

const bnify = BigNumber;

const getValues = (object, named) => {
  if (Array.isArray(object)) {
      let result = [];
      object.forEach(function(object) {
          result.push(getValues(object, named));
      });
      return result;
  }

  switch (object.type) {
      case 'number':
      case 'bigint':
          return ethers.getBigInt(object.value);

      case 'boolean':
      case 'string':
          return object.value;

      case 'buffer':
          return TronWeb.utils.ethersUtils.arrayify(object.value);

      case 'tuple':
          let result = getValues(object.value, named);
          if (named) {
              let namedResult = {};
              result.forEach((value, index) => {
                  namedResult['r' + String(index)] = value;
              });
              return namedResult;
          }
          return result;

      default:
          throw new Error('invalid type - ' + object.type);
  }
}

const equals = (actual, expected) => {
  // Array (treat recursively)
  if (Array.isArray(actual)) {
      if (!Array.isArray(expected) || actual.length !== expected.length) { return false; }
      for (let i = 0; i < actual.length; i++) {
          if (!equals(actual[i], expected[i])) { return false; }
      }
      return true;
  }

  if (['bigint', 'number'].includes(typeof(actual))) { actual = bnify(actual); }
  if (['bigint', 'number'].includes(typeof(expected))) { expected = bnify(expected); }

  // BigNumber
  if (actual.eq) {
      if (typeof(expected) === 'string' && expected.match(/^-?0x[0-9A-Fa-f]*$/)) {
          let neg = (expected.substring(0, 1) === '-');
          if (neg) { expected = expected.substring(1); }
          expected = bnify(expected);
          if (neg) { expected = expected.mul(-1); }
      }
      if (!actual.eq(expected)) { return false; }
      return true;
  }

  // Uint8Array
  if (expected.buffer) {
      if (!actual.buffer || actual.length !== expected.length) { return false; }
      for (let i = 0; i < actual.length; i++) {
          if (actual[i] !== expected[i]) { return false; }
      }

      return true;
  }

  // Maybe address?
  try {
      if (TronWeb.isAddress(actual)) {
        let actualAddress = actual;
        let expectedAddress = TronWeb.address.toHex(expected);

        return (actualAddress === expectedAddress);
      }
  } catch (error) { }

  // Something else
  return (actual === expected);
}


module.exports = {
  getValues,
  equals
}