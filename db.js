const mysql = require("mysql2/promise");
const config = require("./config");

async function query(sql) {
  console.log(sql)
  try{
  const connection = await mysql.createConnection(config.db);
  const [results] = await connection.execute(sql);

  return results;
  }catch(err){
    console.log(err)
  }
}

module.exports = {
  query,
};
