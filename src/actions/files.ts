
'use server';

// This file is deprecated. Storing large files (like videos or ZIPs) as Base64 strings
// directly in a database is highly inefficient, inflates database size, and harms performance.
// The standard practice is to upload files to a dedicated storage service (like Google Cloud
// Storage, AWS S3, or another host) and store only the URL in the database.
//
// The curriculum manager has been updated to accept direct URLs for this purpose.
