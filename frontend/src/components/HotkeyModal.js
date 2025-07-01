import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const HotkeyModal = ({ open, handleClose }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="hotkey-modal-title"
      aria-describedby="hotkey-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography id="hotkey-modal-title" variant="h6" component="h2">
          Keyboard Shortcuts
        </Typography>
        <Typography id="hotkey-modal-description" sx={{ mt: 2 }}>
          <ul>
            <li><strong>Arrow Left:</strong> Dislike</li>
            <li><strong>Arrow Right:</strong> Like</li>
            <li><strong>Arrow Up:</strong> Strong Like</li>
            <li><strong>Arrow Down:</strong> Strong Dislike</li>
            <li><strong>Spacebar:</strong> Save to Watchlist</li>
            <li><strong>Shift:</strong> Not Interested</li>
            <li><strong>Ctrl+Z:</strong> Undo Last Rating</li>
          </ul>
        </Typography>
        <Button onClick={handleClose} sx={{ mt: 2 }}>Close</Button>
      </Box>
    </Modal>
  );
};

export default HotkeyModal;
