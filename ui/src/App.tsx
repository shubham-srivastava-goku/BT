import { useState, useEffect } from 'react';
import './App.css';
import { Alert, Box, Button, MenuItem, Snackbar, TextField } from '@mui/material';
import axios from 'axios';

interface parkingLots {
  id: string,
  parkingName: string,
}

function App() {
  const [message, setMessage] = useState('');
  const [parkingLots, setParkingLots] = useState([] as parkingLots[]);
  const [currentParkingId, setCurrentParkingId] = useState('');
  const [currentSize, setCurrentSize] = useState('small');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [releaseData, setReleaseData] = useState({} as { parkingLotId: string, parkingId: string });
  const [success, setSuccess] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await axios.get('http://localhost:8080/parkingLots');
      setParkingLots(res.data as parkingLots[]);
      setCurrentParkingId(res.data[0].id as string);
    })();
  }, []);

  const callGetSlot = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:8080/getSlot/${currentParkingId}/${currentSize}`);
      console.log('response = ', response);
      if (response.data.success) {
        setMessage(`Slot ${response.data.info.parkingLocation} booked with id ${response.data.info.id} and size ${response.data.info.parkingSize}`);
        setSuccess(true);
      } else {
        setMessage(response.data.error);
        setSuccess(false);
      }
      setOpenSnackbar(true);
    } catch (error) {
      console.error('error in callGetSlot %o', error);
    }
  }

  const handleClose = () => {
    setOpenSnackbar(false);
  }

  const callReleaseSlot = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:8080/releaseSlot/${releaseData.parkingLotId}/${releaseData.parkingId}`);
      console.log('response = ', response);
      if (response.data.success) {
        setMessage(`Slot id ${releaseData.parkingId} released.`);
        setSuccess(true);
      } else {
        setMessage(response.data.error);
        setSuccess(false);
      }
      setOpenSnackbar(true);
    } catch (error) {
      console.error('error in callGetSlot %o', error);
    }
  }

  return (
    <div className="App">
      <Box
        component="form"
        sx={{
          '& > :not(style)': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <h3 style={{ display: 'inline-flex', flexDirection: 'column', position: 'relative' }}>Book a slot:</h3>
        <TextField
          id="select-parking"
          select
          label="Select"
          defaultValue={currentParkingId}
          value={currentParkingId}
          onChange={(event) => {
            setCurrentParkingId(event.target.value as string);
          }}
          helperText="Please select a parking lot"
        >
          {
            parkingLots.map((value) => {
              return (
                <MenuItem value={value.id} key={value.id}>{value.parkingName}</MenuItem>
              )
            })
          }
        </TextField>
        <TextField
          id="select-parking-size"
          select
          label="Select"
          defaultValue={currentSize}
          value={currentSize}
          onChange={(event) => {
            setCurrentSize(event.target.value as string);
          }}
          helperText="Select a size to book"
        >
          {
            ['small', 'medium', 'large', 'xLarge'].map((value) => {
              return (
                <MenuItem value={value} key={value}>{value}</MenuItem>
              )
            })
          }
        </TextField>
        <Button onClick={callGetSlot} variant="contained">Book</Button>
      </Box>
      <Box
        component="form"
        sx={{
          '& > :not(style)': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <h3 style={{ display: 'inline-flex', flexDirection: 'column', position: 'relative' }}>Release a slot:</h3>
        <TextField
          required
          id="outlined-required"
          label="Parking lot ID"
          onChange={(event) => { setReleaseData({ ...releaseData, parkingLotId: event.target.value }); }}
        />
        <TextField
          required
          id="outlined-required"
          label="Parking slot ID"
          onChange={(event) => { setReleaseData({ ...releaseData, parkingId: event.target.value }); }}
        />
        <Button onClick={callReleaseSlot} variant="contained">Release</Button>
      </Box>
      <Snackbar open={openSnackbar} onClose={handleClose}>
        <Alert onClose={handleClose} severity={success ? "success" : "error"} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </div >
  );
}

export default App;
