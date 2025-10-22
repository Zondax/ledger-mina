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

# Function to map device name to installer suffix
get_installer_suffix() {
    local device="$1"
    case "$device" in
        nanox) echo "x" ;;
        nanosp) echo "s2" ;;
        stax) echo "stax" ;;
        flex) echo "flex" ;;
        apex_p) echo "apex_p" ;;
        *) echo "$device" ;;
    esac
}

# Supported devices (device:SDK pairs)
DEVICES=(
    "nanox:NANOX_SDK"
    "nanosp:NANOSP_SDK"
    "stax:STAX_SDK"
    "flex:FLEX_SDK"
    "apex_p:APEX_P_SDK"
)

echo "========================================"
echo "Ledger Mina App - Docker Build Script"
echo "========================================"
echo ""

# Detect if running inside CI/container environment
# Check for CI environment variable or if we're inside the Ledger container
IN_CONTAINER=0
if [ -n "$CI" ] || [ -n "$NANOX_SDK" ] || [ -n "$NANOSP_SDK" ] || [ -n "$STAX_SDK" ] || [ -n "$FLEX_SDK" ] || [ -n "$APEX_P_SDK" ]; then
    IN_CONTAINER=1
    echo "Detected CI/container environment - running directly without Docker"
    echo ""
fi

echo ""
echo "Starting build process..."
echo ""

# Clean before building
echo "Cleaning previous build artifacts..."
if [ "$IN_CONTAINER" = "0" ]; then
    # Running locally - use Docker
    # Pull the latest Docker image
    echo "Pulling latest Docker image..."
    docker pull $DOCKER_IMAGE

    docker run --rm --user "$(id -u):$(id -g)" -v "$(pwd):/app" $DOCKER_IMAGE make clean
else
    # Running in CI/container - run directly
    make clean
fi
echo ""

# Build for each device
for device_pair in "${DEVICES[@]}"; do
    device="${device_pair%%:*}"
    sdk_var="${device_pair##*:}"
    device_upper=$(echo "$device" | tr '[:lower:]' '[:upper:]')

    echo "========================================"
    echo "Building for ${device_upper} (SDK: $sdk_var)"
    echo "========================================"

    build_cmd="export BOLOS_SDK=\$${sdk_var} && make all RELEASE_BUILD=1 PRODUCTION_BUILD=${PRODUCTION_BUILD} && make installer"

    runner_prefix=()
    if [ "$IN_CONTAINER" = "0" ]; then
        # Build with Docker
        runner_prefix=(docker run --rm --user "$(id -u):$(id -g)" -v "$(pwd):/app" "$DOCKER_IMAGE")
    fi

    "${runner_prefix[@]}" bash -c "${build_cmd}"

    # Get installer suffix for this device
    installer_suffix=$(get_installer_suffix "$device")

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
    installer_suffix=$(get_installer_suffix "$device")

    if [ -f "pkg/installer_${installer_suffix}.sh" ]; then
        SIZE=$(ls -lh "pkg/installer_${installer_suffix}.sh" | awk '{print $5}')
        echo "  ✓ pkg/installer_${installer_suffix}.sh ($SIZE)"
    else
        echo "  ✗ pkg/installer_${installer_suffix}.sh (missing)"
    fi
done
echo ""
echo "Usage: ./pkg/installer_{x,s2,stax,flex,apex_p}.sh load"
echo ""
