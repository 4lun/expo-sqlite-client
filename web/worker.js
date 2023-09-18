/*
	Based on code samples from: https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system/
	Original article published under CC-BY-SA-4.0 license https://creativecommons.org/licenses/by-sa/4.0/
*/

const DB_FILENAME = 'mydb.sqlite3';

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

const log = (...args) => postMessage({
	type: 'log',
	payload: { args },
});

const error = (...args) => postMessage({
	type: 'error',
	payload: { args },
});


sqlite3InitModule({ print: log, printErr: log }).then(function (sqlite3) {
	log('Initialised sqlite3.');
  try {
    bootstrap(sqlite3);
  } catch (e) {
    error('Failed to bootstrap sqlite3:', e.message);
  }
}).catch(function (e) {
	error('Failed to init sqlite3:', e.message);
});


const bootstrap = function (sqlite3) {
  let db;
  if ('OpfsDb' in sqlite3.oo1) {
    db = new sqlite3.oo1.OpfsDb(`/${DB_FILENAME}`);
    
  } else {
    db = new sqlite3.oo1.DB(`/${DB_FILENAME}`, 'ct');
    error('OPFS not available, database will not persist');
  }
	log(db.filename);

  try {
    log('Create a table...');
    db.exec('CREATE TABLE IF NOT EXISTS t(a,b)');
    log('Insert some data using exec()...');
    let i;
    for (i = 20; i <= 25; ++i) {
      db.exec({
        sql: 'INSERT INTO t(a,b) VALUES (?,?)',
        bind: [i, i * 2],
      });
    }
    log("Query data with exec() using rowMode 'array'...");
    db.exec({
      sql: 'SELECT a FROM t ORDER BY a LIMIT 3',
      rowMode: 'array', // 'array' (default), 'object', or 'stmt'
      callback: function (row) {
        log('row ', ++this.counter, '=', row);
      }.bind({ counter: 0 }),
    });
  } finally {
    db.close();
  }
};
