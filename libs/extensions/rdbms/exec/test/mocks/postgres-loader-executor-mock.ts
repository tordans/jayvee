// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

import assert = require('assert');

import { BlockExecutorMock } from '@jvalue/jayvee-execution/test';
import { Client } from 'pg';

type MockedPgClient = jest.Mocked<Partial<Client>>;

export class PostgresLoaderExecutorMock implements BlockExecutorMock {
  private _pgClient: MockedPgClient | undefined;

  get pgClient(): MockedPgClient {
    assert(
      this._pgClient !== undefined,
      'Client not initialized - please call setup() first!',
    );
    return this._pgClient;
  }

  setup(
    registerMocks: (
      pgClient: MockedPgClient,
    ) => void = defaultPostgresMockRegistration,
  ) {
    // setup pg mock
    this._pgClient = new Client();
    registerMocks(this._pgClient);
  }
  restore() {
    // cleanup pg mock
    jest.clearAllMocks();
  }
}

export function defaultPostgresMockRegistration(pgClient: MockedPgClient) {
  (pgClient.query as jest.Mock).mockResolvedValue('Success');
}
