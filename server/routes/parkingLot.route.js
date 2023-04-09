import { Router } from "express";
import { getSlot, releaseSlot } from '../service/parkingLot.service.js';
import logger from '../logger/logger.js';

const routes = Router();

routes.post('/getSlot/:parkingLotId/:size', async (req, res) => {
  // #swagger.parameters['parkingLotId'] = { in: 'path', description: 'Id of parking lot' }
  // #swagger.parameters['size'] = { in: 'path', description: 'Size of the parking you want to book ie small, medium, large and xLarge' }

  /* #swagger.responses[200] = {
      description: 'User successfully obtained.',
      schema: {
        success: {
          type: true
        },
        info: {
          id: 123,
          parkingLotId: 123,
          parkingSize: "small",
          parkingLocation: "floor:slot",
        }
      }
  } */
  const { parkingLotId, size } = req.params;
  logger.debug('/getSlot API triggered with parkingLotId %s and size %s', parkingLotId, size);
  res.send(await getSlot(parkingLotId, size));
});

routes.post('/releaseSlot/:parkingLotId/:slotId', async (req, res) => {
  // #swagger.parameters['parkingLotId'] = { in: 'path', description: 'Id of parking lot' }
  // #swagger.parameters['slotId'] = { in: 'path', description: 'Slot id you want to deallocate' }
  // #swagger.responses[202]: { description: 'Parking slot updated successfully' }
  const { parkingLotId, slotId } = req.params;
  logger.debug('/releaseSlot API triggered with parkingLotId %s and slotId %s', parkingLotId, slotId);
  res.send(await releaseSlot(parkingLotId, slotId));
});

export default routes;
