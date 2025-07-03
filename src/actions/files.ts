'use server';

// This file is deprecated. File uploads are now handled entirely on the client-side
// by converting files to Data URIs and storing them in localStorage.
// This approach enhances security by preventing the execution of server-side scripts
// (like shell backdoors) and is consistent with the app's localStorage-based architecture.
// The original server-side upload logic has been removed to avoid confusion.
