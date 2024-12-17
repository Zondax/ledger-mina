#!/usr/bin/env python3

from contextlib import contextmanager

from ragger.backend.interface import BackendInterface, RAPDU
import sys
import os

sys.path.append(os.path.dirname(os.path.realpath(__file__)) + "/../utils/")
import mina_ledger_wallet as mina

class MinaClient:
    backend: BackendInterface

    def __init__(self, backend):
        self._client = backend

    @contextmanager
    def get_address_async(self, account):
        # Create APDU message.
        # CLA 0xe0 CLA
        # INS 0x02 INS_GET_ADDR
        # P1  0x00 UNUSED
        # P2  0x00 UNUSED
        account = '{:08x}'.format(account)
        apduMessage = 'e0020000' + \
            '{:02x}'.format(int(len(account)/2)) + account
        apdu = bytearray.fromhex(apduMessage)

        with self._client.exchange_async_raw(apdu):
            yield

    @contextmanager
    def sign_tx_async(self, tx_type, sender_account, sender_address, receiver, amount, fee, nonce,
                      valid_until, memo, network_id):
        sender_bip44_account = '{:08x}'.format(int(sender_account))
        sender_address = sender_address.encode().hex()
        receiver = receiver.encode().hex()
        amount = '{:016x}'.format(int(amount))
        fee = '{:016x}'.format(int(fee))
        nonce = '{:08x}'.format(nonce)
        valid_until = '{:08x}'.format(valid_until)
        memo = memo.ljust(mina.MAX_MEMO_LEN, '\x00')[
            :mina.MAX_MEMO_LEN].encode().hex()
        tag = '{:02x}'.format(tx_type)
        network_id = '{:02x}'.format(network_id)

        total_len = len(sender_bip44_account) \
            + len(sender_address) \
            + len(receiver) \
            + len(amount) \
            + len(fee) \
            + len(nonce) \
            + len(valid_until) \
            + len(memo) \
            + len(tag) \
            + len(network_id)

        # Create APDU message.
        #     CLA 0xe0 CLA
        #     INS 0x03 INS_SIGN_TX
        #     P1  0x00 UNUSED
        #     P2  0x00 UNUSED
        apduMessage = 'e0030000' + '{:02x}'.format(int(total_len/2)) \
                      + sender_bip44_account \
                      + sender_address \
                      + receiver \
                      + amount \
                      + fee \
                      + nonce \
                      + valid_until \
                      + memo \
                      + tag \
                      + network_id

        apdu = bytearray.fromhex(apduMessage)

        with self._client.exchange_async_raw(apdu):
            yield
