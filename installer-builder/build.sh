#!/usr/bin/env bash
# Build script for Ledger Mina app
# Builds for all supported devices using Docker

set -e

DOCKER_IMAGE="ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest"

# Production build flag (can be overridden via environment variable)
# Default to 0 (non-production) for safety
PRODUCTION_BUILD="${PRODUCTION_BUILD:-0}"

if [ "$PRODUCTION_BUILD" = "1" ]; then
    echo "Building PRODUCTION version"
else
    echo "Building DEVELOPMENT version (set PRODUCTION_BUILD=1 for production)"
fi

# Supported devices (device:SDK pairs)
DEVICES=(
    "nanox:NANOX_SDK"
    "nanosp:NANOSP_SDK"
    "stax:STAX_SDK"
    "flex:FLEX_SDK"
)

echo "========================================"
echo "Ledger Mina App - Docker Build Script"
echo "========================================"
echo ""

# Pull the latest Docker image
echo "Pulling latest Docker image..."
docker pull $DOCKER_IMAGE

echo ""
echo "Starting build process..."
echo ""

# Clean before building
echo "Cleaning previous build artifacts..."
docker run --rm --user "$(id -u):$(id -g)" -v "$(pwd):/app" $DOCKER_IMAGE make clean
echo ""

# Build for each device
for device_pair in "${DEVICES[@]}"; do
    device="${device_pair%%:*}"
    sdk_var="${device_pair##*:}"
    device_upper=$(echo "$device" | tr '[:lower:]' '[:upper:]')

    echo "========================================"
    echo "Building for ${device_upper} (SDK: $sdk_var)"
    echo "========================================"

    # Build with the correct SDK and generate installer (each device builds to its own directory)
    docker run --rm --user "$(id -u):$(id -g)" -v "$(pwd):/app" \
        $DOCKER_IMAGE \
        bash -c "export BOLOS_SDK=\$${sdk_var} && make all RELEASE_BUILD=1 PRODUCTION_BUILD=${PRODUCTION_BUILD} && make installer"

    # Map device name to installer suffix
    case "$device" in
        nanox) installer_suffix="x" ;;
        nanosp) installer_suffix="s2" ;;
        stax) installer_suffix="stax" ;;
        flex) installer_suffix="flex" ;;
        *) installer_suffix="$device" ;;
    esac

    echo ""
    echo "✓ Build completed for ${device_upper}"
    echo "  Binary location: build/${device}/bin/app.elf"
    echo "  Installer location: pkg/installer_${installer_suffix}.sh"
    echo ""
done

echo "========================================"
echo "All builds completed successfully!"
echo "========================================"
echo ""
echo "Build artifacts:"
for device_pair in "${DEVICES[@]}"; do
    device="${device_pair%%:*}"
    if [ -f "build/${device}/bin/app.elf" ]; then
        echo "  ✓ build/${device}/bin/app.elf"
    else
        echo "  ✗ build/${device}/bin/app.elf (missing)"
    fi
done
echo ""
echo "Installer scripts:"
for device_pair in "${DEVICES[@]}"; do
    device="${device_pair%%:*}"
    # Map device name to installer suffix
    case "$device" in
        nanox) installer_suffix="x" ;;
        nanosp) installer_suffix="s2" ;;
        stax) installer_suffix="stax" ;;
        flex) installer_suffix="flex" ;;
        *) installer_suffix="$device" ;;
    esac

    if [ -f "pkg/installer_${installer_suffix}.sh" ]; then
        SIZE=$(ls -lh "pkg/installer_${installer_suffix}.sh" | awk '{print $5}')
        echo "  ✓ pkg/installer_${installer_suffix}.sh ($SIZE)"
    else
        echo "  ✗ pkg/installer_${installer_suffix}.sh (missing)"
    fi
done
echo ""
echo "Usage: ./pkg/installer_{x,s2,stax,flex}.sh load"
echo ""
