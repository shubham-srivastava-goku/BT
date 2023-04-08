import { getSlot, releaseSlot } from '../../../service/parkingLot.service';

jest.mock('postgres', () => {
  return jest.fn(() => {
    const sql = jest.fn();

    sql.begin = jest.fn();
    sql.begin.mockReturnValueOnce([{
      "id": 79,
      "parkingLotId": 2,
      "parkingLocation": "0:3",
      "parkingSize": "small",
    }]);
    sql.begin.mockRejectedValueOnce(new Error('No slot available'));
    sql.mockReturnValueOnce([]);
    return sql;
  });
});

describe('Parking lot service unit test case', () => {
  it('should check for available slot and assign it', async () => {
    const result = await getSlot(1, 'small');
    expect(result.success).toBe(true);
  });

  it('should check for available slot and return false if slot is not available', async () => {
    const result = await getSlot(1, 'small');
    expect(result.success).toBe(false);
  });

  it('should release slot', async () => {
    const result = await releaseSlot(1, 1);
    expect(result.success).toBe(true);
  });
});