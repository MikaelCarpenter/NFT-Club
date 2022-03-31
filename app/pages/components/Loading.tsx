import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const Loading = () => (
  <div>
    <Backdrop open={true}>
      <CircularProgress color="inherit" />
    </Backdrop>
  </div>
);

export default Loading;
