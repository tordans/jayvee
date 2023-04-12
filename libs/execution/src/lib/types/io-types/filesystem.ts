// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

import { IOType } from '@jvalue/jayvee-language-server';

import { FileSystemFile } from './filesystem-node-file';
import { BinaryFile } from './filesystem-node-file-binary';
import { IOTypeImplementation } from './io-type-implementation';

/**
 * FileSystem interface defines the operations that a file system implementation should have.
 * @interface FileSystem
 */
export interface FileSystem extends IOTypeImplementation<IOType.FILE_SYSTEM> {
  /**
   * Retrieves a file from the file system.
   * @function getFile
   * @param {string} path - The path to the file
   * @returns {FileSystemFile<unknown> | null} - The file or null if the node does not exist.
   */
  getFile(path: string): FileSystemFile<unknown> | null;

  /**
   * Saves a file to the file system.
   * @function putNode
   * @param {string} path - The path to the node.
   * @param {FileSystemNode} node - The node to save.
   * @returns {FileSystem | null} - The directory or null if the file failed to insert
   */
  putFile(path: string, file: BinaryFile): FileSystem | null;
}
