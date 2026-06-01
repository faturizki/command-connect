# Backend PocketBase

This repository contains the PocketBase backend scaffold for `command-connect`.

## Setup

1. Download the PocketBase binary from https://pocketbase.io/ and place it in `backend/`.
2. Make sure the binary is executable.
3. Run the dev server:
   ```bash
   cd backend
   make dev
   ```

## Data and migrations

- `backend/pb_data/` is ignored by Git and stores PocketBase runtime data.
- `backend/pb_migrations/` is intended for migration scripts.
- `backend/pb_hooks/` is intended for PocketBase server-side hook scripts.

## Notes

- The PocketBase binary is not included in the repository.
- Keep `backend/pb_data/` private and local to each environment.
