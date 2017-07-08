const expect = require('chai').expect
const sinon = require('sinon')
const oracledb = require('oracledb')
const { executeSql } = require('../src/oracle')

describe('OracleDB Promise-based Utility - test suite', () => {
  describe('executeSql()', () => {
    let sandbox
    beforeEach(() => {
      sandbox = sinon.sandbox.create()
    })
    afterEach(() => {
      sandbox.restore()
    })
    it('should resolve with rows if query returns result', () => {
      const results = {
        outBinds: {
          UserDetailsCursor: {
            getRows: sandbox.stub(oracledb, 'getRows').resolves({rows: []}),
            close: sandbox.stub(oracledb, 'close').resolves()
          }
        }
      }
      const connection = {
        execute: sandbox.stub(oracledb, 'execute').resolves(results),
        release: sandbox.stub(oracledb, 'release').resolves()
      }
      sandbox.stub(oracledb, 'getConnection').resolves(connection)
      executeSql().then(result => {
        expect(result).to.deep.equal({rows: []})
      })
    })

    it('should reject with error if query does not return result', () => {
      const results = {
        outBinds: {
          UserDetailsCursor: {
            getRows: sandbox.stub(oracledb, 'getRows').rejects(new Error()),
            close: sandbox.stub(oracledb, 'close').resolves()
          }
        }
      }
      const connection = {
        execute: sandbox.stub(oracledb, 'execute').resolves(results),
        release: sandbox.stub(oracledb, 'release').resolves()
      }
      sandbox.stub(oracledb, 'getConnection').resolves(connection)
      executeSql().catch(err => {
        expect(err).to.be.an('error')
      })
    })

    it.only('should close results and connection after promise resolves', (done) => {
      const results = {
        outBinds: {
          UserDetailsCursor: {
            getRows: sandbox.stub(oracledb, 'getRows').resolves({rows: []}),
            close: sandbox.stub(oracledb, 'close').resolves()
          }
        }
      }
      const connection = {
        execute: sandbox.stub(oracledb, 'execute').resolves(results),
        release: sandbox.stub(oracledb, 'release').resolves()
      }
      sandbox.stub(oracledb, 'getConnection').resolves(connection)
      executeSql().then(result => {
        done()
        expect(connection.release.called).to.be.true
      })
    })

    it('should close results and connection after promise rejects', () => {
      const results = {
        outBinds: {
          UserDetailsCursor: {
            getRows: sandbox.stub(oracledb, 'getRows').rejects(new Error()),
            close: sandbox.stub(oracledb, 'close').resolves()
          }
        }
      }
      const connection = {
        execute: sandbox.stub(oracledb, 'execute').resolves(results),
        release: sandbox.stub(oracledb, 'release').resolves()
      }
      sandbox.stub(oracledb, 'getConnection').resolves(connection)
      executeSql().catch(err => {
        expect(results.outBinds.UserDetailsCursor.getRows.called).to.be.true
      })
    })
  })
})