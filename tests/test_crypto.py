#!/usr/bin/env python3

import pytest


def test_crypto(backend):
    apdu = bytearray.fromhex("e004000000")
    assert(not backend.send_raw(apdu))


