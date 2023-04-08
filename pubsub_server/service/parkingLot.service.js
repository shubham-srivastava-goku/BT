import postgres from 'postgres';

const sql = postgres('postgres://postgres:1234@localhost/parking');

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
    console.log('result 1', result);
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
    return {
      success: true,
      info: await bookSlot(parkingId, size)
    };
  } catch (error) {
    console.error('Error in getSlot function %o', error);
    return { success: false, error: error.message };
  }
}

export const releaseSlot = async (parkingId, slotId) => {
  try {
    await sql`update parking_details set parking_filled = false where id = ${slotId}`;

    return {
      success: true
    };
  } catch (error) {
    console.error('Error in releaseSlot function %o', error);
    return { success: false, error: error.message };
  }
}
