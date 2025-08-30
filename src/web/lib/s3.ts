import { AwsClient } from "aws4fetch";
import { env } from "cloudflare:workers";

/**
 * S3 client for workers app using aws4fetch (WinterCG-compliant)
 *
 * @todo this could be a R2 binding but just using s3 api since it makes testing with minio easier
 * (since we also need minio for testing with the agent nodejs server)
 */
export const s3Client = new AwsClient({
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  service: "s3",
  region: "auto", // Will be parsed from endpoint URL
});

export async function deleteFolderFromS3(folderName: string) {
  try {
    const bucketName = env.S3_BUCKET;
    const endpoint = env.S3_ENDPOINT;

    console.log(`Deleting folder: ${folderName}`);

    // List all objects with the folder prefix
    const listUrl = `${endpoint}/${bucketName}?list-type=2&prefix=${encodeURIComponent(
      folderName
    )}`;

    const listResponse = await s3Client.fetch(listUrl, {
      method: "GET",
    });

    if (!listResponse.ok) {
      console.error(
        `Failed to list objects: ${listResponse.status} ${listResponse.statusText}`
      );
      return;
    }

    const listXml = await listResponse.text();

    // Parse the XML response to extract object keys
    const objectKeys = parseListObjectsResponse(listXml);

    if (objectKeys.length === 0) {
      console.log(`No objects found for folder: ${folderName}`);
      return;
    }

    console.log(
      `Deleting ${objectKeys.length} objects for folder: ${folderName}`
    );

    // Prepare the delete request body
    const deleteBody = `<?xml version="1.0" encoding="UTF-8"?>
<Delete>
${objectKeys
  .map((key) => `  <Object><Key>${escapeXml(key)}</Key></Object>`)
  .join("\n")}
</Delete>`;

    // Calculate MD5 hash of the request body
    const deleteBodyBytes = new TextEncoder().encode(deleteBody);
    const deleteBodyHash = await crypto.subtle.digest("MD5", deleteBodyBytes);
    const deleteBodyMd5 = btoa(
      String.fromCharCode(...new Uint8Array(deleteBodyHash))
    );

    // Delete all objects in the folder
    const deleteUrl = `${endpoint}/${bucketName}?delete`;

    const deleteResponse = await s3Client.fetch(deleteUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
        "Content-MD5": deleteBodyMd5,
      },
      body: deleteBody,
    });

    if (!deleteResponse.ok) {
      console.error(
        `Failed to delete objects: ${deleteResponse.status} ${deleteResponse.statusText}`
      );
      const errorText = await deleteResponse.text();
      console.error("Delete error response:", errorText);
    } else {
      const deleteXml = await deleteResponse.text();
      const deletedCount = parseDeleteResponse(deleteXml);
      console.log(
        `Successfully deleted ${deletedCount} objects for folder: ${folderName}`
      );
    }
  } catch (error) {
    console.error("Error deleting folder from S3:", error);
    // Don't throw the error to avoid breaking the video deletion process
    // The database deletion should still succeed even if S3 cleanup fails
  }
}

// Helper function to parse ListObjectsV2 XML response
function parseListObjectsResponse(xml: string): string[] {
  const keys: string[] = [];
  const keyRegex = /<Key>(.*?)<\/Key>/g;
  let match;

  while ((match = keyRegex.exec(xml)) !== null) {
    keys.push(match[1]);
  }

  return keys;
}

// Helper function to parse DeleteObjects XML response
function parseDeleteResponse(xml: string): number {
  const deletedRegex = /<Deleted>(.*?)<\/Deleted>/g;
  let count = 0;

  while (deletedRegex.exec(xml) !== null) {
    count++;
  }

  return count;
}

// Helper function to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
