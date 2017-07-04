const oracledb = require('oracledb')

const maxRows = 10000

const connectionAttrs = {
  user: process.env.ORACLE_USER_ID,
  password: process.env.ORACLE_PASSWORD
}

const releaseConnections = (resultSet, connection) => {
  process.nextTick(() => {
    if (resultSet) {
      resultSet
        .close
        .then(() => {
          connection
            .release
            .catch(err => {
              throw err
            })
        })
        .catch(err => {
          throw err
        })
    } else {
      connection
        .release
        .catch(err => {
          throw err
        })
    }
  })
}

const processResultSet = (results, resolve, reject, connection) => {
  const resultSet = results.outBinds.UserDetailsCursor
  if (!resultSet) throw new Error()
  resultSet
    .getRows(maxRows)
    .then(rows => {
      if (!rows || rows.length === 0) {
        resolve(rows)
        releaseConnections(resultSet, connection)
        return
      }
      resolve(rows)
      releaseConnections(resultSet, connection)
    })
    .catch(err => {
      reject(err)
      releaseConnections(resultSet, connection)
    })
}

const executeSql = (sql, params) => {
  return new Promise((resolve, reject) => {
    oracledb
      .getConnection(connectionAttrs)
      .then(connection => {
        return connection
          .execute(sql, params, { autoCommit: true, outFormat: oracledb.OBJECT })
          .then(results => {
            processResultSet(results, resolve, reject, connection)
          })
          .catch(err => {
            reject(err)
            releaseConnections(connection)
          })
      })
      .catch(err => {
        reject(err)
      })
  })
}

module.exports = {
  executeSql
}