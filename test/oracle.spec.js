const expect = require('chai').expect
const sinon = require('sinon')
const oracledb = require('oracledb')
const { executeSql } = require('../src/oracle')

describe('OracleDB Promise-based Utility - test suite', () => {
    describe('executeSql()', () => {
        it('should resolve with rows if query returns result', () => {
            const results = {
              outBinds: {
                UserDetailsCursor: {
                  getRows: sinon.stub(oracledb, 'getRows').resolves({rows: []}),
                  close: sinon.stub(oracledb, 'close').resolves()
                }
              }
            }
            const connectionToExecute = {
              execute: sinon.stub(oracledb, 'execute').resolves(results),
              release: sinon.stub(oracledb, 'release').resolves()
            }
            sinon.stub(oracledb, 'getConnection').resolves(connectionToExecute)
            expect(executeSql().then(result => result)).to.deep.equal({rows: []})
        })

        it('should reject with error if query does not return result', () => {
            sinon.stub().rejects(new Error())
        })

        it('should close connection after promise resolves', () => {
            sinon.stub(connection, 'execute').resolves({rows: []})
            expect(executeSql().then(results => results)).to.deep.equal({rows: []})
        })

        it('should close connection after promise rejects', () => {
            
        })
    })
})