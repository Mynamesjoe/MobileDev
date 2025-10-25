# Backend Configuration

This directory contains configuration files for managing different backend environments.

## Files

- `backend.ts` - Main backend configuration with URL management

## Usage

The app is currently configured to use the hosted backend at `https://micksbarber.ccshub.uk`.

### Switching Backends

To switch between different backends, edit `backend.ts`:

```typescript
export const BACKEND_CONFIG = {
  // Current active backend
  ACTIVE: 'PRIMARY' as 'PRIMARY' | 'FALLBACK' | 'LOCAL'
};
```

### Available Backends

- **PRIMARY**: `https://micksbarber.ccshub.uk` (HTTPS - Recommended)
- **FALLBACK**: `http://109.123.227.37:3000` (HTTP - Backup)
- **LOCAL**: `http://localhost:3000` (Development)

### Backend Status

✅ **Primary Backend**: [https://micksbarber.ccshub.uk](https://micksbarber.ccshub.uk) - Running  
✅ **Fallback Backend**: [http://109.123.227.37:3000](http://109.123.227.37:3000) - Running

Both backends are confirmed to be running and accessible.
