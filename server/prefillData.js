import postgres from 'postgres';
import config from './config/config.js';

const { username, password, host, port, databaseName } = config.database;

const checkAndCreateDatabase = async () => {
  const sql = postgres(`postgres://${username}:${password}@${host}:${port}`);
  const databases = await sql`
    SELECT datname FROM pg_database;
  `;
  const databaseExists = databases.find((database) => {
    return database.datname === 'parking';
  });
  if (!databaseExists) {
    await sql`
      CREATE database parking
    `;
  }
  sql.CLOSE;
}

const createTable1 = async (sql) => {
  await sql`
    CREATE table parking_lot (
      id SERIAL PRIMARY KEY,
      parking_name varchar NOT NULL
    )
  `;
}

const createTable2 = async (sql) => {
  await sql`
    CREATE TABLE parking_details (
      id SERIAL,
      parking_lot_id int NOT NULL,
      parking_location varchar NOT NULL,
      parking_size varchar NOT NULL,
      parking_filled boolean NOT NULL DEFAULT false,
      CONSTRAINT parking_details_pk PRIMARY KEY (id),
      CONSTRAINT parking_details_fk FOREIGN KEY (parking_lot_id) REFERENCES public.parking_lot(id)
  )`;
}

const createTableIfNotExist = async (sql) => {
  const tableRes = await sql`
    SELECT table_name as "tableName"
    FROM information_schema.tables
    WHERE table_schema='public'
    AND table_type='BASE TABLE'
  `;

  const table1 = tableRes.find((table) => {
    return table.tableName === 'parking_lot';
  });
  const table2 = tableRes.find((table) => {
    return table.tableName === 'parking_details';
  });
  if (!table1) {
    await createTable1(sql);
  }
  if (!table2) {
    await createTable2(sql);
  }
}

const autofillTable = async (sql) => {
  const res = await sql`
    select count(id) from parking_lot;
  `;
  if (res[0].count === '0') {
    let sql_parking = [];
    let sql_parking_details = [];
    for (let i = 1; i <= 2; i += 1) {
      sql_parking.push({
        id: i,
        parking_name: `parking_name_${i}`
      });
      let counter = 0;
      for (let j = 1; j <= 2; j += 1) {
        const small = {
          parking_lot_id: i,
          parking_location: `0:${++counter}`,
          parking_size: 'small',
        };
        sql_parking_details.push(small);
        sql_parking_details.push({ ...small, parking_location: `1:${counter}` });
        sql_parking_details.push({ ...small, parking_location: `2:${counter}` });
        const medium = {
          parking_lot_id: i,
          parking_location: `0:${++counter}`,
          parking_size: 'medium',
        };
        sql_parking_details.push(medium);
        sql_parking_details.push({ ...medium, parking_location: `1:${counter}` });
        sql_parking_details.push({ ...medium, parking_location: `2:${counter}` });
        const large = {
          parking_lot_id: i,
          parking_location: `0:${++counter}`,
          parking_size: 'large',
        };
        sql_parking_details.push(large);
        sql_parking_details.push({ ...large, parking_location: `1:${counter}` });
        sql_parking_details.push({ ...large, parking_location: `2:${counter}` });
        const xLarge = {
          parking_lot_id: i,
          parking_location: `0:${++counter}`,
          parking_size: 'xLarge',
        };
        sql_parking_details.push(xLarge);
        sql_parking_details.push({ ...xLarge, parking_location: `1:${counter}` });
        sql_parking_details.push({ ...xLarge, parking_location: `2:${counter}` });
      }
    }
    try {
      await sql.begin(sql => [
        sql`INSERT INTO parking_lot  ${sql(sql_parking, 'id', 'parking_name')}`,
        sql`INSERT INTO parking_details  ${sql(sql_parking_details, 'parking_lot_id', 'parking_location', 'parking_size')}`,
      ]);
    } catch (error) {
      console.log('Error while filling the data %o', error);
    }
  }
}

(async () => {
  await checkAndCreateDatabase();
  const sql = postgres(`postgres://${username}:${password}@${host}:${port}/${databaseName}`);
  await createTableIfNotExist(sql);
  await autofillTable(sql);
  sql.CLOSE;
  process.exit(1);
})();
