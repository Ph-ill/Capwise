import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotification } from './NotificationContext';

const Notification = () => {
  const { notification, hideNotification } = useNotification();

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={notification ? notification.duration : null}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      {notification && (
        <Alert
          onClose={hideNotification}
          severity={notification.type} // success, info, warning, error
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      )}
    </Snackbar>
  );
};

export default Notification;