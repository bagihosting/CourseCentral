
'use server';

// This file is deprecated. File uploads for lessons are now handled by converting
// files to Base64 Data URIs on the client-side and storing them directly in the
// `courses` table in the database. This keeps the application self-contained
// without external file storage dependencies.
