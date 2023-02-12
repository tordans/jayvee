import * as https from 'https';

import * as R from '@jayvee/execution';
import { BlockExecutor } from '@jayvee/execution';
import { File, FileExtension, MimeType } from '@jayvee/language-server';

export class HttpExtractorExecutor extends BlockExecutor<void, File> {
  constructor() {
    super('HttpExtractor');
  }

  override async execute(): Promise<R.Result<File>> {
    // Accessing attribute values by their name:
    const url = this.getStringAttributeValue('url');

    const file = await this.fetchRawDataAsFile(url);

    if (R.isErr(file)) {
      return file;
    }

    return R.ok(file.right);
  }

  private fetchRawDataAsFile(url: string): Promise<R.Result<File>> {
    this.logger.logDebug(`Fetching raw data from ${url}`);
    return new Promise((resolve) => {
      https.get(url, (response) => {
        const responseCode = response.statusCode;

        // Catch errors
        if (responseCode === undefined || responseCode >= 400) {
          resolve(
            R.err({
              message: `HTTP fetch failed with code ${
                responseCode ?? 'undefined'
              }. Please check your connection.`,
              diagnostic: { node: this.getOrFailAttribute('url') },
            }),
          );
        }

        // Get chunked data and store to ArrayBuffer
        let rawData = new Uint8Array(0);
        response.on('data', (chunk: Buffer) => {
          const tmp = new Uint8Array(rawData.length + chunk.length);
          tmp.set(rawData, 0);
          tmp.set(chunk, rawData.length);
          rawData = tmp;
        });

        // When all data is downloaded, create file
        response.on('end', () => {
          this.logger.logDebug(`Successfully fetched raw data`);
          response.headers;

          // Infer Mimetype from HTTP-Header, if not inferrable, then default to application/octet-stream
          let inferredMimeType = response.headers['content-type'] as MimeType;
          if (!Object.values(MimeType).includes(inferredMimeType)) {
            inferredMimeType = MimeType.APPLICATION_OCTET_STREAM;
          }

          // Infer FileExtension from user input, if not inferrable, then default to None
          let inferredFileExtension = this.getStringAttributeValue(
            'fileExtension',
          ) as FileExtension;
          if (!Object.values(MimeType).includes(inferredMimeType)) {
            inferredFileExtension = FileExtension.NONE;
          }

          // Create file and return file
          const file: File = {
            name: this.getStringAttributeValue('fileName'),
            extension: inferredFileExtension,
            content: rawData.buffer as ArrayBuffer,
            mimeType: inferredMimeType,
          };
          resolve(R.ok(file));
        });

        response.on('error', (errorObj) => {
          resolve(
            R.err({
              message: errorObj.message,
              diagnostic: { node: this.block, property: 'name' },
            }),
          );
        });
      });
    });
  }
}
