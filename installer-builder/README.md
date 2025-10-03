# Ledger Mina App - Installer Builder

This directory contains scripts and Makefiles for building and packaging the Ledger Mina app for all supported devices.

## Overview

The installer builder automates:
1. Building the app for all Ledger devices using Docker
2. Automatically generating device-specific installer scripts during build
3. Creating portable installers with correct TARGET_ID for each device

## Directory Structure

```
installer-builder/
├── build.sh                    # Builds app for all devices and generates installers
├── Makefile.installer          # Makefile fragment for installer generation
├── template.sh                 # Installer script template
└── README.md                   # This file
```

## Quick Start

### Build all device variants with installers:
```bash
make build
```

This will:
1. Build binaries for each device
2. Generate device-specific installer scripts with correct parameters

Output:
- Binaries: `build/{device}/bin/app.elf`
- Installers: `pkg/installer_{suffix}.sh`

Supported devices:
- Nano X (`build/nanox/` → `pkg/installer_x.sh`)
- Nano S Plus (`build/nanosp/` → `pkg/installer_s2.sh`)
- Stax (`build/stax/` → `pkg/installer_stax.sh`)
- Flex (`build/flex/` → `pkg/installer_flex.sh`)

## Using the Generated Installers

Each generated installer is a self-contained script that embeds the compiled app hex file.

### Load app to device:
```bash
./pkg/installer_x.sh load
```

### Delete app from device:
```bash
./pkg/installer_x.sh delete
```

### Show app version:
```bash
./pkg/installer_x.sh version
```

## Requirements

### For building:
- Docker

### For using installers:
- Python 3
- `ledgerblue` package: `pip3 install ledgerblue`
- Physical Ledger device connected and unlocked

## How It Works

### Build Process (`build.sh` + `Makefile.installer`)

1. Pulls the latest `ledger-app-dev-tools` Docker image
2. Cleans previous build artifacts
3. For each device:
   - Sets the appropriate `BOLOS_SDK` environment variable
   - Runs `make all RELEASE_BUILD=1` inside Docker
   - Builds to device-specific directory (`build/{device}/`)
   - Runs `make installer` to generate installer script
   - Installer uses SDK-provided `APP_LOAD_PARAMS` with correct `TARGET_ID` for each device

### Device-Specific Parameters

Each device has its own `TARGET_ID` automatically set by the SDK:
- Nano X: `0x33100004`
- Nano S Plus: `0x33200004`
- Stax: `0x33300004`
- Flex: `0x33400004`

The installer generation happens **inside** the Docker build context, ensuring all parameters (TARGET_ID, targetVersion, apiLevel, etc.) are correctly populated for each specific device.

### Installer Template (`template.sh`)

The template provides:
- Dependency checking (Python 3, ledgerblue)
- Hex file extraction to temporary directory
- Load/delete/version commands
- Error handling

## Supported Devices

| Device | SDK Variable | Build Directory | Installer |
|--------|-------------|-----------------|-----------|
| Nano X | `NANOX_SDK` | `build/nanox/` | `pkg/installer_x.sh` |
| Nano S Plus | `NANOSP_SDK` | `build/nanosp/` | `pkg/installer_s2.sh` |
| Stax | `STAX_SDK` | `build/stax/` | `pkg/installer_stax.sh` |
| Flex | `FLEX_SDK` | `build/flex/` | `pkg/installer_flex.sh` |

## Cleaning

```bash
make clean
```

Removes all build artifacts and generated installers.

## Troubleshooting

### Docker issues
- Ensure Docker is running
- Pull the latest image: `docker pull ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest`

### Installer issues
- Install ledgerblue: `pip3 install ledgerblue`
- Connect and unlock your Ledger device
- Exit any running apps on the device

### Build artifacts missing
- Run `make build` to build all devices and generate installers
- Check that builds completed successfully

## Advanced Usage

### Run build script directly:

```bash
./installer-builder/build.sh
```

### Build for a specific device (inside Docker):

```bash
docker run --rm -v "$(pwd):/app" ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest \
  bash -c "export BOLOS_SDK=\$NANOX_SDK && make all RELEASE_BUILD=1 && make installer"
```

## License

Apache License 2.0 - See LICENSE file for details
