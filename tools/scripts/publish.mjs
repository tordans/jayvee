// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

import {execSync} from 'child_process';
import {getOutputPath} from "./shared-util.mjs";

// Executing this script: node path/to/publish.mjs {projectName}
const [, , projectName] = process.argv;

const outputPath = getOutputPath(projectName);

execSync(`npm publish ${outputPath}`);
