import postgres from 'postgres';
import config from '../config/config.js';
import logger from '../logger/logger.js';
import e from 'express';

const { username, password, host, port, databaseName } = config.database;
const sql = postgres(`postgres://${username}:${password}@${host}:${port}/${databaseName}`);

const bookSlot = async (parkingId, size) => {
  const finalResponse = await sql.begin(async (sql) => {
    const result = await sql `
      select
        id,
        parking_lot_id as "parkingLotId",
        parking_location as "parkingLocation",
        parking_size as "parkingSize"
      from parking_details
      where parking_lot_id = ${parkingId} and parking_size = ${size} and parking_filled is not true
      FOR UPDATE SKIP LOCKED limit 1
    `;
    if (result.length > 0) {
      await sql`update parking_details set parking_filled = true where id = ${result[0].id}`;
    } else {
      if (size === 'xLarge') {
        throw new Error('No slot available');
      }
      if (size === 'small') {
        size = 'medium';
      } else if (size === 'medium') {
        size = 'large';
      } else if (size === 'large') {
        size = 'xLarge';
      }
      return bookSlot(parkingId, size);
    }

    return result[0];
  });

  return finalResponse;
}

export const getSlot = async (parkingId, size) => {
  try {
    logger.debug('getSlot function triggered with parkingId %s and size %s', parkingId, size);
    return {
      success: true,
      info: await bookSlot(parkingId, size)
    };
  } catch (error) {
    logger.error('error inside releaseSlot %o', error);
    return { success: false, error: error.message };
  }
}

export const releaseSlot = async (parkingId, slotId) => {
  try {
    logger.debug('releaseSlot function triggered with parkingId %s and slotId %s', parkingId, slotId);
    const response = await sql `select * from parking_details where parking_lot_id = ${parkingId} and id = ${slotId}`;
    if (response.length) {
      await sql `update parking_details set parking_filled = false where id = ${slotId}`;
      return {
        success: true
      };
    } else {
      logger.error('Parking id %s not present for parking lot %s', slotId, parkingId);
      return {
        success: false,
        error: `Parking id ${slotId} not present for parking lot ${parkingId}`
      };
    }
  } catch (error) {
    logger.error('error inside releaseSlot %o', error);
    return { success: false, error: error.message };
  }
}
