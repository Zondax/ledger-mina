#!/usr/bin/env python3


from mina_client import *


class TestsAddress:
    def test_get_address_0(self, preauth_navigator, backend, scenario_navigator):
        # Address generation tests
        #
        #     These tests were automatically generated from the Mina c-reference-signer
        #
        #     Details:  https://github.com/MinaProtocol/c-reference-signer/README.markdown
        #     Generate: ./unit_tests ledger_gen

        minaClient = MinaClient(backend)
        # account 0
        # private key 164244176fddb5d769b7de2027469d027ad428fadcc0c02396e6280142efb718
        with minaClient.get_address_async(0):
            preauth_navigator.navigate()
            scenario_navigator.address_review_approve()

        response: bytes = backend.last_async_response.data.decode('utf-8').rstrip('\x00')

        assert (response == "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV")

    def test_get_address_1(self, preauth_navigator, backend, scenario_navigator):
        minaClient = MinaClient(backend)

        # account 1
        # private key 3ca187a58f09da346844964310c7e0dd948a9105702b716f4d732e042e0c172e
        with minaClient.get_address_async(1):
            preauth_navigator.navigate()
            scenario_navigator.address_review_approve()

        response: bytes = backend.last_async_response.data.decode('utf-8').rstrip('\x00')

        assert (response == "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt")


    def test_get_address_2(self, preauth_navigator, backend, scenario_navigator):
        minaClient = MinaClient(backend)

        # account 2
        # private key 336eb4a19b3d8905824b0f2254fb495573be302c17582748bf7e101965aa4774
        with minaClient.get_address_async(2):
            preauth_navigator.navigate()
            scenario_navigator.address_review_approve()

        response: bytes = backend.last_async_response.data.decode('utf-8').rstrip('\x00')

        assert (response == "B62qrKG4Z8hnzZqp1AL8WsQhQYah3quN1qUj3SyfJA8Lw135qWWg1mi")


    def test_get_address_3(self, preauth_navigator, backend, scenario_navigator):
        minaClient = MinaClient(backend)

        # account 3
        # private key 1dee867358d4000f1dafa5978341fb515f89eeddbe450bd57df091f1e63d4444
        with minaClient.get_address_async(3):
            preauth_navigator.navigate()
            scenario_navigator.address_review_approve()

        response: bytes = backend.last_async_response.data.decode('utf-8').rstrip('\x00')

        assert (response == "B62qoqiAgERjCjXhofXiD7cMLJSKD8hE8ZtMh4jX5MPNgKB4CFxxm1N")

    def test_get_address_49370(self, preauth_navigator, backend, scenario_navigator):
        minaClient = MinaClient(backend)

        # account 49370
        # private key 20f84123a26e58dd32b0ea3c80381f35cd01bc22a20346cc65b0a67ae48532ba
        with minaClient.get_address_async(49370):
            preauth_navigator.navigate()
            scenario_navigator.address_review_approve()

        response: bytes = backend.last_async_response.data.decode('utf-8').rstrip('\x00')

        assert (response == "B62qkiT4kgCawkSEF84ga5kP9QnhmTJEYzcfgGuk6okAJtSBfVcjm1M")


    def test_get_address_x312a(self, preauth_navigator, backend, scenario_navigator):
        minaClient = MinaClient(backend)

        # account 0x312a
        # private key 3414fc16e86e6ac272fda03cf8dcb4d7d47af91b4b726494dab43bf773ce1779
        with minaClient.get_address_async(0x312a):
            preauth_navigator.navigate()
            scenario_navigator.address_review_approve()

        response: bytes = backend.last_async_response.data.decode('utf-8').rstrip('\x00')

        assert (response == "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4")


class TestsSign:
    def test_sign_tx_0(self, backend, scenario_navigator):
        # Sign transaction tests
        #
        #     These tests were automatically generated from the Mina c-reference-signer
        #
        #     Details:  https://github.com/MinaProtocol/c-reference-signer/README.markdown
        #     Generate: ./unit_tests ledger_gen

        minaClient = MinaClient(backend)

        # account 0
        # private key 164244176fddb5d769b7de2027469d027ad428fadcc0c02396e6280142efb718
        # sig=11a36a8dfe5b857b95a2a7b7b17c62c3ea33411ae6f4eb3a907064aecae353c60794f1d0288322fe3f8bb69d6fabd4fd7c15f8d09f8783b2f087a80407e299af
        with minaClient.sign_tx_async(mina.TX_TYPE_PAYMENT,
                       0,
                       "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
                       "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
                       1729000000000,
                       2000000000,
                       16,
                       271828,
                       "Hello Mina!",
                       mina.TESTNET_ID):
            scenario_navigator.review_approve()

        response: bytes = backend.last_async_response.data.hex()

        assert (response == "11a36a8dfe5b857b95a2a7b7b17c62c3ea33411ae6f4eb3a907064aecae353c60794f1d0288322fe3f8bb69d6fabd4fd7c15f8d09f8783b2f087a80407e299af")


    def test_sign_tx_12586(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 12586
        # private key 3414fc16e86e6ac272fda03cf8dcb4d7d47af91b4b726494dab43bf773ce1779
        # sig=23a9e2375dd3d0cd061e05c33361e0ba270bf689c4945262abdcc81d7083d8c311ae46b8bebfc98c584e2fb54566851919b58cf0917a256d2c1113daa1ccb27f
        with minaClient.sign_tx_async(mina.TX_TYPE_PAYMENT,
                       12586,
                       "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
                       "B62qrKG4Z8hnzZqp1AL8WsQhQYah3quN1qUj3SyfJA8Lw135qWWg1mi",
                       314159265359,
                       1618033988,
                       0,
                       4294967295,
                       "",
                       mina.TESTNET_ID):
            scenario_navigator.review_approve()

        response: bytes = backend.last_async_response.data.hex()
        assert (response == "23a9e2375dd3d0cd061e05c33361e0ba270bf689c4945262abdcc81d7083d8c311ae46b8bebfc98c584e2fb54566851919b58cf0917a256d2c1113daa1ccb27f")


    def test_sign_tx_12586_1(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 12586
        # private key 3414fc16e86e6ac272fda03cf8dcb4d7d47af91b4b726494dab43bf773ce1779
        # sig=2b4d0bffcb57981d11a93c05b17672b7be700d42af8496e1ba344394da5d0b0b0432c1e8a77ee1bd4b8ef6449297f7ed4956b81df95bdc6ac95d128984f77205
        with minaClient.sign_tx_async(mina.TX_TYPE_PAYMENT,
                       12586,
                       "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
                       "B62qoqiAgERjCjXhofXiD7cMLJSKD8hE8ZtMh4jX5MPNgKB4CFxxm1N",
                       271828182845904,
                       100000,
                       5687,
                       4294967295,
                       "01234567890123456789012345678901",
                       mina.TESTNET_ID):
            scenario_navigator.review_approve()

        response: bytes = backend.last_async_response.data.hex()

        assert (response == "2b4d0bffcb57981d11a93c05b17672b7be700d42af8496e1ba344394da5d0b0b0432c1e8a77ee1bd4b8ef6449297f7ed4956b81df95bdc6ac95d128984f77205")


    def test_sign_tx_3(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 3
        # private key 1dee867358d4000f1dafa5978341fb515f89eeddbe450bd57df091f1e63d4444
        # sig=25bb730a25ce7180b1e5766ff8cc67452631ee46e2d255bccab8662e5f1f0c850a4bb90b3e7399e935fff7f1a06195c6ef89891c0260331b9f381a13e5507a4c
        with minaClient.sign_tx_async(mina.TX_TYPE_PAYMENT,
                       3,
                       "B62qoqiAgERjCjXhofXiD7cMLJSKD8hE8ZtMh4jX5MPNgKB4CFxxm1N",
                       "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
                       0,
                       2000000000,
                       0,
                       1982,
                       "",
                       mina.TESTNET_ID):
            scenario_navigator.review_approve()

        response: bytes = backend.last_async_response.data.hex()

        assert (response == "25bb730a25ce7180b1e5766ff8cc67452631ee46e2d255bccab8662e5f1f0c850a4bb90b3e7399e935fff7f1a06195c6ef89891c0260331b9f381a13e5507a4c")


    def test_sign_tx_0_1(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 0
        # private key 164244176fddb5d769b7de2027469d027ad428fadcc0c02396e6280142efb718
        # sig=30797d7d0426e54ff195d1f94dc412300f900cc9e84990603939a77b3a4d2fc11ebab12857b47c481c182abe147279732549f0fd49e68d5541f825e9d1e6fa04
        with minaClient.sign_tx_async(mina.TX_TYPE_DELEGATION,
                       0,
                       "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
                       "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
                       0,
                       2000000000,
                       16,
                       1337,
                       "Delewho?",
                       mina.TESTNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()

        assert (response == "30797d7d0426e54ff195d1f94dc412300f900cc9e84990603939a77b3a4d2fc11ebab12857b47c481c182abe147279732549f0fd49e68d5541f825e9d1e6fa04")


    def test_sign_tx_49370(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 49370
        # private key 20f84123a26e58dd32b0ea3c80381f35cd01bc22a20346cc65b0a67ae48532ba
        # sig=07e9f88fc671ed06781f9edb233fdbdee20fa32303015e795747ad9e43fcb47b3ce34e27e31f7c667756403df3eb4ce670d9175dd0ae8490b273485b71c56066
        with minaClient.sign_tx_async(mina.TX_TYPE_DELEGATION,
                       49370,
                       "B62qkiT4kgCawkSEF84ga5kP9QnhmTJEYzcfgGuk6okAJtSBfVcjm1M",
                       "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
                       0,
                       2000000000,
                       0,
                       4294967295,
                       "",
                       mina.TESTNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()
        assert (response == "07e9f88fc671ed06781f9edb233fdbdee20fa32303015e795747ad9e43fcb47b3ce34e27e31f7c667756403df3eb4ce670d9175dd0ae8490b273485b71c56066")


    def test_sign_tx_12586_2(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 12586
        # private key 3414fc16e86e6ac272fda03cf8dcb4d7d47af91b4b726494dab43bf773ce1779
        # sig=1ff9f77fed4711e0ebe2a7a46a7b1988d1b62a850774bf299ec71a24d5ebfdd81d04a570e4811efe867adefe3491ba8b210f24bd0ec8577df72212d61b569b15
        with minaClient.sign_tx_async(mina.TX_TYPE_DELEGATION,
                       12586,
                       "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
                       "B62qkiT4kgCawkSEF84ga5kP9QnhmTJEYzcfgGuk6okAJtSBfVcjm1M",
                       0,
                       42000000000,
                       1,
                       4294967295,
                       "more delegates, more fun........",
                       mina.TESTNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()
        assert (response == "1ff9f77fed4711e0ebe2a7a46a7b1988d1b62a850774bf299ec71a24d5ebfdd81d04a570e4811efe867adefe3491ba8b210f24bd0ec8577df72212d61b569b15")


    def test_sign_tx_2(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 2
        # private key 336eb4a19b3d8905824b0f2254fb495573be302c17582748bf7e101965aa4774
        # sig=26ca6b95dee29d956b813afa642a6a62cd89b1929320ed6b099fd191a217b08d2c9a54ba1c95e5000b44b93cfbd3b625e20e95636f1929311473c10858a27f09
        with minaClient.sign_tx_async(mina.TX_TYPE_DELEGATION,
                       2,
                       "B62qrKG4Z8hnzZqp1AL8WsQhQYah3quN1qUj3SyfJA8Lw135qWWg1mi",
                       "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
                       0,
                       1202056900,
                       0,
                       577216,
                       "",
                       mina.TESTNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()
        assert (response == "26ca6b95dee29d956b813afa642a6a62cd89b1929320ed6b099fd191a217b08d2c9a54ba1c95e5000b44b93cfbd3b625e20e95636f1929311473c10858a27f09")


    def test_sign_tx_0_2(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 0
        # private key 164244176fddb5d769b7de2027469d027ad428fadcc0c02396e6280142efb718
        # sig=124c592178ed380cdffb11a9f8e1521bf940e39c13f37ba4c55bb4454ea69fba3c3595a55b06dac86261bb8ab97126bf3f7fff70270300cb97ff41401a5ef789
        with minaClient.sign_tx_async(mina.TX_TYPE_PAYMENT,
                       0,
                       "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
                       "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
                       1729000000000,
                       2000000000,
                       16,
                       271828,
                       "Hello Mina!",
                       mina.MAINNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()
        assert (response == "124c592178ed380cdffb11a9f8e1521bf940e39c13f37ba4c55bb4454ea69fba3c3595a55b06dac86261bb8ab97126bf3f7fff70270300cb97ff41401a5ef789")


    def test_sign_tx_12586_3(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 12586
        # private key 3414fc16e86e6ac272fda03cf8dcb4d7d47af91b4b726494dab43bf773ce1779
        # sig=204eb1a37e56d0255921edd5a7903c210730b289a622d45ed63a52d9e3e461d13dfcf301da98e218563893e6b30fa327600c5ff0788108652a06b970823a4124
        with minaClient.sign_tx_async(mina.TX_TYPE_PAYMENT,
                       12586,
                       "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
                       "B62qrKG4Z8hnzZqp1AL8WsQhQYah3quN1qUj3SyfJA8Lw135qWWg1mi",
                       314159265359,
                       1618033988,
                       0,
                       4294967295,
                       "",
                       mina.MAINNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()
        assert (response == "204eb1a37e56d0255921edd5a7903c210730b289a622d45ed63a52d9e3e461d13dfcf301da98e218563893e6b30fa327600c5ff0788108652a06b970823a4124")


    def test_sign_tx_12586_4(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 12586
        # private key 3414fc16e86e6ac272fda03cf8dcb4d7d47af91b4b726494dab43bf773ce1779
        # sig=076d8ebca8ccbfd9c8297a768f756ff9d08c049e585c12c636d57ffcee7f6b3b1bd4b9bd42cc2cbee34b329adbfc5127fe5a2ceea45b7f55a1048b7f1a9f7559
        with minaClient.sign_tx_async(mina.TX_TYPE_PAYMENT,
                       12586,
                       "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
                       "B62qoqiAgERjCjXhofXiD7cMLJSKD8hE8ZtMh4jX5MPNgKB4CFxxm1N",
                       271828182845904,
                       100000,
                       5687,
                       4294967295,
                       "01234567890123456789012345678901",
                       mina.MAINNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()
        assert (response == "076d8ebca8ccbfd9c8297a768f756ff9d08c049e585c12c636d57ffcee7f6b3b1bd4b9bd42cc2cbee34b329adbfc5127fe5a2ceea45b7f55a1048b7f1a9f7559")


    def test_sign_tx_3_1(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 3
        # private key 1dee867358d4000f1dafa5978341fb515f89eeddbe450bd57df091f1e63d4444
        # sig=058ed7fb4e17d9d400acca06fe20ca8efca2af4ac9a3ed279911b0bf93c45eea0e8961519b703c2fd0e431061d8997cac4a7574e622c0675227d27ce2ff357d9
        with minaClient.sign_tx_async(mina.TX_TYPE_PAYMENT,
                       3,
                       "B62qoqiAgERjCjXhofXiD7cMLJSKD8hE8ZtMh4jX5MPNgKB4CFxxm1N",
                       "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
                       0,
                       2000000000,
                       0,
                       1982,
                       "",
                       mina.MAINNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()
        assert (response == "058ed7fb4e17d9d400acca06fe20ca8efca2af4ac9a3ed279911b0bf93c45eea0e8961519b703c2fd0e431061d8997cac4a7574e622c0675227d27ce2ff357d9")


    def test_sign_tx_0_3(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 0
        # private key 164244176fddb5d769b7de2027469d027ad428fadcc0c02396e6280142efb718
        # sig=0904e9521a95334e3f6757cb0007ec8af3322421954255e8d263d0616910b04d213344f8ec020a4b873747d1cbb07296510315a2ec76e52150a4c765520d387f
        with minaClient.sign_tx_async(mina.TX_TYPE_DELEGATION,
                       0,
                       "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
                       "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
                       0,
                       2000000000,
                       16,
                       1337,
                       "Delewho?",
                       mina.MAINNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()
        assert (response == "0904e9521a95334e3f6757cb0007ec8af3322421954255e8d263d0616910b04d213344f8ec020a4b873747d1cbb07296510315a2ec76e52150a4c765520d387f")


    def test_sign_tx_49370_1(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 49370
        # private key 20f84123a26e58dd32b0ea3c80381f35cd01bc22a20346cc65b0a67ae48532ba
        # sig=2406ab43f8201bd32bdd81b361fdb7871979c0eec4e3b7a91edf87473963c8a4069f4811ebc5a0e85cbb4951bffe93b638e230ce5a250cb08d2c250113a1967c
        with minaClient.sign_tx_async(mina.TX_TYPE_DELEGATION,
                       49370,
                       "B62qkiT4kgCawkSEF84ga5kP9QnhmTJEYzcfgGuk6okAJtSBfVcjm1M",
                       "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
                       0,
                       2000000000,
                       0,
                       4294967295,
                       "",
                       mina.MAINNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()
        assert (response == "2406ab43f8201bd32bdd81b361fdb7871979c0eec4e3b7a91edf87473963c8a4069f4811ebc5a0e85cbb4951bffe93b638e230ce5a250cb08d2c250113a1967c")


    def test_sign_tx_12586_5(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 12586
        # private key 3414fc16e86e6ac272fda03cf8dcb4d7d47af91b4b726494dab43bf773ce1779
        # sig=36a80d0421b9c0cbfa08ea95b27f401df108b30213ae138f1f5978ffc59606cf2b64758db9d26bd9c5b908423338f7445c8f0a07520f2154bbb62926aa0cb8fa
        with minaClient.sign_tx_async(mina.TX_TYPE_DELEGATION,
                       12586,
                       "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
                       "B62qkiT4kgCawkSEF84ga5kP9QnhmTJEYzcfgGuk6okAJtSBfVcjm1M",
                       0,
                       42000000000,
                       1,
                       4294967295,
                       "more delegates, more fun........",
                       mina.MAINNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()
        assert (response == "36a80d0421b9c0cbfa08ea95b27f401df108b30213ae138f1f5978ffc59606cf2b64758db9d26bd9c5b908423338f7445c8f0a07520f2154bbb62926aa0cb8fa")


    def test_sign_tx_2_1(self, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # account 2
        # private key 336eb4a19b3d8905824b0f2254fb495573be302c17582748bf7e101965aa4774
        # sig=093f9ef0e4e051279da0a3ded85553847590ab739ee1bfd59e5bb30f98ed8a001a7a60d8506e2572164b7a525617a09f17e1756ac37555b72e01b90f37271595
        with minaClient.sign_tx_async(mina.TX_TYPE_DELEGATION,
                       2,
                       "B62qrKG4Z8hnzZqp1AL8WsQhQYah3quN1qUj3SyfJA8Lw135qWWg1mi",
                       "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
                       0,
                       1202056900,
                       0,
                       577216,
                       "",
                       mina.MAINNET_ID):
            scenario_navigator.review_approve()

        response: bytes=backend.last_async_response.data.hex()
        assert (response == "093f9ef0e4e051279da0a3ded85553847590ab739ee1bfd59e5bb30f98ed8a001a7a60d8506e2572164b7a525617a09f17e1756ac37555b72e01b90f37271595")


    def test_sign_tx_0_4(self, test_name, backend, scenario_navigator):

        minaClient = MinaClient(backend)

        # Check testnet and mainnet signatures are not equal
        with minaClient.sign_tx_async(mina.TX_TYPE_PAYMENT,
                       0,
                       "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
                       "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
                       1729000000000,
                       2000000000,
                       16,
                       271828,
                       "Hello Mina!",
                       mina.MAINNET_ID):
            scenario_navigator.review_approve(test_name=test_name + "_mainet")

        response_main: bytes=backend.last_async_response.data.hex()

        with minaClient.sign_tx_async(mina.TX_TYPE_PAYMENT,
                       0,
                       "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
                       "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
                       1729000000000,
                       2000000000,
                       16,
                       271828,
                       "Hello Mina!",
                       mina.TESTNET_ID):
            scenario_navigator.review_approve(test_name=test_name + "_testnet")

        response_test: bytes=backend.last_async_response.data.hex()

        assert(response_main != response_test)
