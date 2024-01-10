/* eslint-disable import/no-default-export */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/// <reference types="@flysoftbeta/qqntim-typings" />

import { chronocat } from '@chronocat/core'

export default class Entry implements QQNTim.Entry.Main {
  constructor() {
    void chronocat()
  }
}
