var expect = require('chai').expect;
// TODO: How does this compares to requiring some function directly?
//var any = require('lodash-node/modern/collections').any;
var any = require('lodash-node/modern/collections/some');
var find = require('lodash-node/modern/collections/find');

var _accounts = [];
var _prototype = { username: '', password: '', isDeleted: false };

function accountExists(username, password) {
  return any(_accounts, function (acct) {
    var exists = (acct.username === username && password === undefined)
      || (acct.username === username && acct.password === password);

    return exists;
  });
}

function findAccount(username) {
  return find(_accounts, function (acct) { return acct.username === username; });
}

module.exports = {
  exists: function (username, password) {
      expect(username).to.be.a('string');
      expect(username).to.not.be.empty();
      if (password !== undefined) {
        expect(password).to.be.a('string');
        expect(password).to.not.be.empty();
      }

      return accountExists(username, password);
  }

  , add: function (username, password) {
    expect(username).to.be.a('string');
    expect(username).to.not.be.empty();
    expect(password).to.be.a('string');
    expect(password).to.not.be.empty();

    var exists = accountExists(username);
    if (exists){
      return false;
    }

    var newAccount = Object.create(_prototype);
    newAccount.username = username;
    newAccount.password = password;

    _accounts.push(newAccount);
    return true;
  }

  , delete: function (username) {
    expect(username).to.be.a('string');
    expect(username).to.be.non.empty();

    var foundAccount = findAccount(username);
    if (foundAccount !== undefined) {
      foundAccount.isDeleted = true;
      return true;
    }

    return false;
  }

  , update: function (username, password) {
    expect(username).to.be.a('string');
    expect(username).to.be.non.empty();
    expect(password).to.be.a('string');
    expect(password).to.not.be.empty();

    var foundAccount = findAccount(username);
    if (foundAccount !== undefined) {
      foundAccount.password = password;
      return true;
    }

    return false;
  }

  , getAll: function () {
    return _accounts;
  }
};
