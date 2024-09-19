# ledger-app-mina

## Overview
This is the Mina app for the Ledger Nano S and Nano X hardware wallet.

## Building and installing
To build and install the app on your Ledger Nano you must set up the Ledger Nano build environments. Please follow the Getting Started instructions at [here](https://ledger.readthedocs.io/en/latest/userspace/getting_started.html).

### With a terminal

The [ledger-app-dev-tools](https://github.com/LedgerHQ/ledger-app-builder/pkgs/container/ledger-app-builder%2Fledger-app-dev-tools) docker image contains all the required tools and libraries to **build**, **test** and **load** an application.

You can download it from the ghcr.io docker repository:

```shell
sudo docker pull ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest
```

You can then enter this development environment by executing the following command from the directory of the application `git` repository:

**Linux (Ubuntu)**

```shell
sudo docker run --rm -ti --user "$(id -u):$(id -g)" --privileged -v "/dev/bus/usb:/dev/bus/usb" -v "$(realpath .):/app" ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest
```

**macOS**

```shell
sudo docker run  --rm -ti --user "$(id -u):$(id -g)" --privileged -v "$(pwd -P):/app" ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest
```

**Windows (with PowerShell)**

```shell
docker run --rm -ti --privileged -v "$(Get-Location):/app" ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest
```

The application's code will be available from inside the docker container, you can proceed to the following compilation steps to build your app.

## Compilation and load

To easily setup a development environment for compilation and loading on a physical device, you can use the [VSCode integration](#with-vscode) whether you are on Linux, macOS or Windows.

If you prefer using a terminal to perform the steps manually, you can use the guide below.

### Compilation

Setup a compilation environment by following the [shell with docker approach](#with-a-terminal).

From inside the container, use the following command to build the app :

```shell
make DEBUG=1  # compile optionally with PRINTF
```

You can choose which device to compile and load for by setting the `BOLOS_SDK` environment variable to the following values :

* `BOLOS_SDK=$NANOS_SDK`
* `BOLOS_SDK=$NANOX_SDK`
* `BOLOS_SDK=$NANOSP_SDK`
* `BOLOS_SDK=$STAX_SDK`
* `BOLOS_SDK=$FLEX_SDK`

By default this variable is set to build/load for Nano S.

### Loading on a physical device

This step will vary slightly depending on your platform.

:information_source: Your physical device must be connected, unlocked and the screen showing the dashboard (not inside an application).

**Linux (Ubuntu)**

First make sure you have the proper udev rules added on your host :

```shell
# Run these commands on your host, from the app's source folder.
sudo cp .vscode/20-ledger.ledgerblue.rules /etc/udev/rules.d/
sudo udevadm control --reload-rules 
sudo udevadm trigger
```

Then once you have [opened a terminal](#with-a-terminal) in the `app-builder` image and [built the app](#compilation-and-load) for the device you want, run the following command :

```shell
# Run this command from the app-builder container terminal.
make load    # load the app on a Nano S by default
```

[Setting the BOLOS_SDK environment variable](#compilation-and-load) will allow you to load on whichever supported device you want.

**macOS / Windows (with PowerShell)**

:information_source: It is assumed you have [Python](https://www.python.org/downloads/) installed on your computer.

Run these commands on your host from the app's source folder once you have [built the app](#compilation-and-load) for the device you want :

```shell
# Install Python virtualenv
python3 -m pip install virtualenv 
# Create the 'ledger' virtualenv
python3 -m virtualenv ledger
```

Enter the Python virtual environment

* macOS : `source ledger/bin/activate`
* Windows : `.\ledger\Scripts\Activate.ps1`

```shell
# Install Ledgerblue (tool to load the app)
python3 -m pip install ledgerblue 
# Load the app.
python3 -m ledgerblue.runScript --scp --fileName bin/app.apdu --elfFile bin/app.elf
`````

## Tests

The Mina app comes with functional tests implemented with Ledger's [Ragger](https://github.com/LedgerHQ/ragger) test framework.

### Linux (Ubuntu)

Install the tests requirements :

```shell
pip install -r tests/requirements.txt 
```

Then you can :

Run the functional tests (here for nanos but available for any device once you have built the binaries) :

```shell
pytest tests/ --tb=short -v --device nanos
```

Or run your app directly with Speculos

```shell
speculos --model nanos build/nanos/bin/app.elf
```

Or even the tests on device

```shell
pytest tests/ --tb=short -v --device nanos --backend ledgercomm
```

## Command-line wallet

This package provides a simple command-line wallet that interfaces
with your Ledger device and Mina blockchain to allow you to generate
addresses, sign transaction and submit them to the Mina network.

```bash
$ ./utils/mina_ledger_wallet.py -h
usage: mina_ledger_wallet.py [-h] [--verbose]
                             {get-address,get-balance,send-payment,delegate}
                             ...

positional arguments:
  {get-address,get-balance,send-payment,delegate}

optional arguments:
  -h, --help            show this help message and exit
  --verbose             Verbose mode
```
There is additional help available for each subcommand.

**Get address**

```bash
$ ./utils/mina_ledger_wallet.py get-address 1
Get address for account 1 (path 44'/12586'/1'/0/0)
Continue? (y/N) y
Generating address (please confirm on Ledger device)... done
Received address: B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt
```
This generates the keypair corresponding to hardware wallet account 1 (BIP44 account `44'/12586'/1'/0/0`) and returns the corresponding Mina address.

**Get balance**

```bash
$ ./utils/mina_ledger_wallet.py get-balance B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt
Getting network identifier... debug
Getting account balance... done

Address: B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt
Balance: 9792.0
```
This queries the Mina blockchain for the balance of address `B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt`.

**Send payment**

```bash
$ ./utils/mina_ledger_wallet.py send-payment 1 B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt B62qrPN5Y5yq8kGE3FbVKbGTdTAJNdtNtB5sNVpxyRwWGcDEhpMzc8g 2.71821
```

This sends a payment of 2.71821 Mina from hardware wallet account 1 (`B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt`) to recipient `B62qrPN5Y5yq8kGE3FbVKbGTdTAJNdtNtB5sNVpxyRwWGcDEhpMzc8g`.

**Delegate**

```bash
$ ./utils/mina_ledger_wallet.py delegate 1 B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt B62qrPN5Y5yq8kGE3FbVKbGTdTAJNdtNtB5sNVpxyRwWGcDEhpMzc8g --memo "Delegation is fun!"
```

This delegates the entire balance of hardware wallet account 1 (`B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt`) to delegate `B62qrPN5Y5yq8kGE3FbVKbGTdTAJNdtNtB5sNVpxyRwWGcDEhpMzc8g`.

## Documentation
This follows the specification available in the [`api.asc`](https://github.com/LedgerHQ/ledger-app-boilerplate/blob/master/doc/api.asc).
