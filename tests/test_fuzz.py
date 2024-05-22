#!/usr/bin/env python3

import pytest
import argparse
import sys
import os
import time
from ragger.navigator import NavInsID, NavIns
from contextlib import contextmanager
from pathlib import Path

from mina_client import *
sys.path.append(os.path.dirname(os.path.realpath(__file__)) + "/../utils/")
import mina_ledger_wallet as mina

TESTS_ROOT_DIR = Path(__file__).parent


def test_fuzz(test_name, backend, firmware, navigator):
        # Invalid message 1
        apdu = bytearray.fromhex("")
        assert(not backend.send_raw(apdu))

        # Invalid message 2
        apdu = bytearray.fromhex("00")
        assert(not backend.send_raw(apdu))

        # Invalid message 3
        apdu = bytearray.fromhex("a5a501a6")
        assert(not backend.send_raw(apdu))

        # Invalid message 4
        apdu = bytearray.fromhex("b08fdaeeb08fdaee6e8f58de53c7f54e3b86ef06d646e0c28173ab524cf21297eed41c870346760ecee46558de53c7f5b08fdaee6e8f58de53c7f54e3b86e119a24cf21f06d646e0c28173ab5465b08fdaee6e8f58de53c7f54e3b86e119a24cf21297eed41c8703467652279a3e7ec598ef6f06d646e0c28173ab57f897719eb5db73b16043bc7cc0c94cf21297eed41c870346760ecee465")
        assert(not backend.send_raw(apdu))

        # Invalid message 5
        apdu = bytearray.fromhex("000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")
        assert(not backend.send_raw(apdu))

        # Invalid command
        apdu = bytearray.fromhex("01f600000400000000")
        assert(not backend.send_raw(apdu))

        # Invalid instruction 1
        apdu = bytearray.fromhex("e00000000400000000")
        assert(not backend.send_raw(apdu))

        # Invalid instruction 2
        apdu = bytearray.fromhex("e00500000400000000")
        assert(not backend.send_raw(apdu))

        # Invalid instruction 3
        apdu = bytearray.fromhex("e0ff00000400000000")
        assert(not backend.send_raw(apdu))

        # Invalid get address (message too small, corrupt client)
        apdu = bytearray.fromhex("e00200000300000000")
        assert(not backend.send_raw(apdu))

        # Ledger boilerplate bug
        # Invalid get address (too small, corrupt ledger protocol)
        apdu = bytearray.fromhex("e002000004")
        assert(not backend.send_raw(apdu))

        # Invalid get address (message too big, corrupt client 1)
        apdu = bytearray.fromhex("e00200000500000000")
        assert(not backend.send_raw(apdu))

        # Invalid get address (message too big, corrupt client 2)
        apdu = bytearray.fromhex("e0020000ff00000000")
        assert(not backend.send_raw(apdu))

        # Ledger API bug - This should be detected by Ledger
        # Invalid get address (message too big, corrupt ledger protocol)
        apdu = bytearray.fromhex("e0020000040000000000")
        assert(not backend.send_raw(apdu))

        # Invalid get address 4294967296 (account number range)
        apdu = bytearray.fromhex("e0020000050100000000")
        assert(not backend.send_raw(apdu))

        # Invalid get address 18446744073709551615 (account number range, message too big)
        apdu = bytearray.fromhex("e002000008ffffffffffffffff")
        assert(not backend.send_raw(apdu))

        # Valid get max address 4294967295
        apdu = bytearray.fromhex("e002000004ffffffff")
        assert(backend.send_raw(apdu) == None)

        # Invalid sign tx (message way too small)
        apdu = bytearray.fromhex("e00300000158000000004236327172476158")
        assert(not backend.send_raw(apdu))

        # Invalid sign tx (message too small, corrupt client)
        apdu = bytearray.fromhex("e0030000aa00000000423632716e7a62586d524e6f397133326e34534e75326d70423865374659594c48384e6d6158366f464342596a6a513853624437757a56423632716963697059787945487537516a557153375176426970547335437a676b595a5a5a6b506f4b5659427536746e44556345395a7400000192906e4a00000000007735940000000010000425d448656c6c6f204d696e612100000000000000000000000000000000000000000000")
        assert(not backend.send_raw(apdu))

        # Invalid sign tx (message too small, corrupt client)
        apdu = bytearray.fromhex("e00300000000000000423632716e7a62586d524e6f397133326e34534e75326d70423865374659594c48384e6d6158366f464342596a6a513853624437757a56423632716963697059787945487537516a557153375176426970547335437a676b595a5a5a6b506f4b5659427536746e44556345395a7400000192906e4a00000000007735940000000010000425d448656c6c6f204d696e612100000000000000000000000000000000000000000000")
        assert(not backend.send_raw(apdu))

        # Ledger boilerplate bug (very bad things!)
        # Invalid sign tx (message too small, corrupt ledger 1)
        apdu = bytearray.fromhex("e0030000ab")
        assert(not backend.send_raw(apdu))

        # Invalid sign tx (message too big, corrupt client 1)
        apdu = bytearray.fromhex("e0030000ff00000000423632716e7a62586d524e6f397133326e34534e75326d70423865374659594c48384e6d6158366f464342596a6a513853624437757a56423632716963697059787945487537516a557153375176426970547335437a676b595a5a5a6b506f4b5659427536746e44556345395a7400000192906e4a00000000007735940000000010000425d448656c6c6f204d696e612100000000000000000000000000000000000000000000")
        assert(not backend.send_raw(apdu))

        # Invalid sign tx (message too big, corrupt client 2)
        apdu = bytearray.fromhex("e0030000ac000000004236327172476158683977656b6677614132797a55626862764659796e6b6d426b68594c56333664767935416b52766765516e593676784236327170614463386e66753461377867686b456e6938753272426a7837454839354d46655a41685467476f666f706178466a6453375000000192906e4a00000000007735940000000010000425d448656c6c6f204d696e612100000000000000000000000000000000000000000000")
        assert(not backend.send_raw(apdu))

        # Invalid sign tx (message too big, corrupt client 3)
        apdu = bytearray.fromhex("e0030000ad000000004236327172476158683977656b6677614132797a55626862764659796e6b6d426b68594c56333664767935416b52766765516e593676784236327170614463386e66753461377867686b456e6938753272426a7837454839354d46655a41685467476f666f706178466a6453375000000192906e4a00000000007735940000000010000425d448656c6c6f204d696e612100000000000000000000000000000000000000000000")
        assert(not backend.send_raw(apdu))

        # Ledger boilerplate bug
        # Invalid sign tx (message way too big, corrupt ledger 1)
        apdu = bytearray.fromhex("e0030000ab00000000423632716e7a62586d524e6f397133326e34534e75326d70423865374659594c48384e6d6158366f464342596a6a513853624437757a56423632716963697059787945487537516a557153375176426970547335437a676b595a5a5a6b506f4b5659427536746e44556345395a7400000192906e4a00000000007735940000000010000425d448656c6c6f204d696e61210000000000000000000000000000000000000000000000")
        assert(not backend.send_raw(apdu))

        # Ledger bug - Causes client to hang (subsequent requests work).
        #
        #     The hex length is 676.  Anything less than this does not freeze the API.
        #     This should be detected by Ledger.  Could be a ledgerblue bug.
        # # Invalid sign tx (message way too big, corrupt ledger 1)
        # apdu = bytearray.fromhex("e0030000ab00000000423632716e7a62586d524e6f397133326e34534e75326d70423865374659594c48384e6d6158366f464342596a6a513853624437757a56423632716963697059787945487537516a557153375176426970547335437a676b595a5a5a6b506f4b5659427536746e44556345395a7400000192906e4a00000000007735940000000010000425d448656c6c6f204d696e612100000000000000000000000000000000000000000000e0030000015800000000423632716e7a62586d524e6f397133326e34534e75326d70423865374659594c48384e6d6158366f464342596a6a513853624437757a56423632716963697059787945487537516a557153375176426970547335437a676b595a5a5a6b506f4b5659427536746e44556345395a7400000192906e4a00000000007735940000000010000425d448656c6c6f204d696e612100000000000000")
        # assert(not backend.send_raw(apdu))

        # Invalid sign tx (sender address does not match account number)
        apdu = bytearray.fromhex("e0030000ab000000004236327172476158683977656b6677614132797a55626862764659796e6b6d426b68594c56333664767935416b52766765516e593676784236327170614463386e66753461377867686b456e6938753272426a7837454839354d46655a41685467476f666f706178466a6453375000000192906e4a00000000007735940000000010000425d448656c6c6f204d696e612100000000000000000000000000000000000000000000")
        assert(not backend.send_raw(apdu))

        # Invalid sign tx (corrupt sender addresses)
        #                                                 X
        apdu = bytearray.fromhex("e0030000ab000000004236327172F476158683977656b6677614132797a55626862764659796e6b6d426b68594c56333664767935416b52766765516e593676784236327170614463386e66753461377867686b456e6938753272426a7837454839354d46655a41685467476f666f706178466a6453375000000192906e4a00000000007735940000000010000425d448656c6c6f204d696e6121000000000000000000000000000000000000000000001")
        assert(not backend.send_raw(apdu))

        # Invalid sign tx (corrupt receiver addresses)
        #                                                                                                                                                               X
        apdu = bytearray.fromhex("e0030000ab000000004236327172476158683977656b6677614132797a55626862764659796e6b6d426b68594c56333664767935416b52766765516e593676784236327172F476158683977656b6677614132797a55626862764659796e6b6d426b68594c56333664767935416b52766765516e5936767800000192906e4a00000000007735940000000010000425d448656c6c6f204d696e61210000000000000000000000000000000000000000000")
        assert(not backend.send_raw(apdu))

        # Invalid sign tx (invalid tx type)
        apdu = bytearray.fromhex("e0030000ab00000000423632716e7a62586d524e6f397133326e34534e75326d70423865374659594c48384e6d6158366f464342596a6a513853624437757a56423632716963697059787945487537516a557153375176426970547335437a676b595a5a5a6b506f4b5659427536746e44556345395a7400000192906e4a00000000007735940000000010000425d448656c6c6f204d696e612100000000000000000000000000000000000000000003")
        assert(not backend.send_raw(apdu))

