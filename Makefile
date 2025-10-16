#*******************************************************************************
#   Ledger App
#   (c) 2017 Ledger
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#*******************************************************************************

ifeq ($(BOLOS_SDK),)
ifneq ($(MAKECMDGOALS),installers)
ifneq ($(MAKECMDGOALS),clean)
ifneq ($(MAKECMDGOALS),docker-clean)
$(error Environment variable BOLOS_SDK is not set)
endif
endif
endif
endif

ifndef COIN
COIN=mina
endif

VARIANT_PARAM=COIN
VARIANT_VALUES=$(COIN)

# Add and push a new git tag to update the app version
GIT_DESCRIBE=$(shell git describe --tags --abbrev=8 --always --long --dirty 2>/dev/null)
VERSION_TAG=$(shell echo $(GIT_DESCRIBE) | sed 's/^v//g')
APPVERSION_M=1
APPVERSION_N=5
APPVERSION_P=1
APPVERSION=$(APPVERSION_M).$(APPVERSION_N).$(APPVERSION_P)
APPNAME = "Mina"

#APP_LOAD_PARAMS= --path "44'/12586'" --curve secp256k1 --appFlags 0x200 $(COMMON_LOAD_PARAMS)
# Application allowed derivation curves.
# Possibles curves are: secp256k1, secp256r1, ed25519 and bls12381g1
# If your app needs it, you can specify multiple curves by using:
# `CURVE_APP_LOAD_PARAMS = <curve1> <curve2>`
CURVE_APP_LOAD_PARAMS = secp256k1

# Application allowed derivation paths.
# You should request a specific path for your app.
# This serve as an isolation mechanism.
# Most application will have to request a path according to the BIP-0044
# and SLIP-0044 standards.
# If your app needs it, you can specify multiple path by using:
# `PATH_APP_LOAD_PARAMS = "44'/1'" "45'/1'"`

APPPATH = "44'/12586'"
$(info PATHS LIST = $(APPPATH))
PATH_APP_LOAD_PARAMS = $(APPPATH)

# Application icons following guidelines:
# https://developers.ledger.com/docs/embedded-app/design-requirements/#device-icon
ICON_NANOS = icons/nanos_app_mina.gif
ICON_NANOX = icons/nanox_app_mina.gif
ICON_NANOSP = icons/nanox_app_mina.gif
ICON_STAX = icons/stax_app_mina.gif
ICON_FLEX = icons/flex_app_mina.gif
ICON_APEX_P = icons/apex_p_app_mina.png

################
# Default rule #
################
all: default

############
# Platform #
############

# Set DEFINES and convenience helper based on environmental flags
ifneq ($(shell echo "$(MAKECMDGOALS)" | grep -c side_release),0)
ifeq ($(RELEASE_BUILD),0)
RELEASE_BUILD=1
endif
endif

ifeq ($(RELEASE_BUILD),0)
DEFINES += HAVE_CRYPTO_TESTS
else
RELEASE_BUILD=1
endif

ifneq ("$(ON_DEVICE_UNIT_TESTS)","")
DEFINES   += HAVE_ON_DEVICE_UNIT_TESTS
ON_DEVICE_UNIT_TESTS=1
else
ON_DEVICE_UNIT_TESTS=0
endif

ifeq ("$(NO_STACK_CANARY)","")
ifeq ($(RELEASE_BUILD),0)
DEFINES   += HAVE_BOLOS_APP_STACK_CANARY
STACK_CANARY=1
else
STACK_CANARY=0
endif
else
STACK_CANARY=0
endif

# Make environmental flags consistent with DEFINES
ifneq ($(shell echo $(DEFINES) | grep -c HAVE_ON_DEVICE_UNIT_TESTS), 0)
ON_DEVICE_UNIT_TESTS=1
else
ON_DEVICE_UNIT_TESTS=0
endif
ifeq ($(shell echo $(DEFINES) | grep -c HAVE_BOLOS_APP_STACK_CANARY), 0)
NO_STACK_CANARY=0
else
NO_STACK_CANARY=1
endif

# Production build flag (only set if explicitly provided)
ifdef PRODUCTION_BUILD
    ifeq ($(PRODUCTION_BUILD), 1)
        $(info ************ PRODUCTION_BUILD  = [PRODUCTION BUILD])
    else
        $(info ************ PRODUCTION_BUILD  = [INTERNAL USE - NOT FOR PRODUCTION])
    endif
    DEFINES += PRODUCTION_BUILD=$(PRODUCTION_BUILD)
else
    DEFINES += PRODUCTION_BUILD=1
endif

# App-specific defines
DEFINES   += LEDGER_BUILD
DEFINES   += UNUSED\(x\)=\(void\)x
DEFINES   += APPNAME=\"$(APPNAME)\"
DEFINES   += APPVERSION=\"$(APPVERSION)\"

ifneq ("$(MAKECMDGOALS)", "clean")
ifneq ("$(MAKECMDGOALS)", "allclean")
$(info )
$(info ================)
$(info Build parameters)
$(info ================)
$(info TARGETS              $(MAKECMDGOALS))
$(info RELEASE_BUILD        $(RELEASE_BUILD))
$(info TARGET_NAME          $(TARGET_NAME))
$(info ON_DEVICE_UNIT_TESTS $(ON_DEVICE_UNIT_TESTS))
$(info STACK_CANARY         $(STACK_CANARY))
$(info )
endif
endif

ifeq ($(RELEASE_BUILD),1)
ifneq ($(shell echo $(DEFINES) | grep -c HAVE_BOLOS_APP_STACK_CANARY),0)
$(error HAVE_BOLOS_APP_STACK_CANARY should not be used for release builds);
endif
ifneq ($(shell echo $(DEFINES) | grep -c HAVE_ON_DEVICE_UNIT_TESTS),0)
$(error HAVE_ON_DEVICE_UNIT_TESTS should not be used for release builds);
endif
endif

### variables processed by the common makefile.rules of the SDK to grab source files and include dirs
APP_SOURCE_PATH  += src

APP_LOAD_PARAMS_EVALUATED=$(shell printf '\\"%s\\" ' $(APP_LOAD_PARAMS))
APP_DELETE_PARAMS_EVALUATED=$(shell printf '\\"%s\\" ' $(COMMON_DELETE_PARAMS))

define RELEASE_README
ledger-app-mina-$(VERSION_TAG)

Contents
    ./install.sh         - Load app onto Ledger device
    ./uninstall.sh       - Delete app from Ledger device
    ./mina_ledger_wallet - Command-line wallet

For more details visit https://github.com/jspada/ledger-app-mina
endef
export RELEASE_README

define RELEASE_DEPS
if ! which python3 > /dev/null 2>&1 ; then
    echo "Error: Please install python3"
	exit 211;
fi
if ! which pip3 > /dev/null 2>&1 ; then
    echo "Error: Please install pip3"
	exit
fi
if ! pip3 -q show ledgerblue ; then
    echo "Error: please pip3 install ledgerblue"
	exit
fi
read -p "Please unlock your Ledger device and exit any apps (press any key to continue) " unused
endef
export RELEASE_DEPS

HAVE_APPLICATION_FLAG_BOLOS_SETTINGS = 1

ENABLE_BLUETOOTH = 1
ENABLE_NBGL_QRCODE = 1

ifneq ($(MAKECMDGOALS),installers)
ifneq ($(MAKECMDGOALS),clean)
ifneq ($(MAKECMDGOALS),docker-clean)
include $(BOLOS_SDK)/Makefile.standard_app
include $(CURDIR)/installer-builder/Makefile.installer
endif
endif
endif

side_release: all
	@# Must force clean like this because Ledger makefile always runs first
	@echo
	@echo "SIDE RELEASE BUILD: Forcing clean"
	@echo
	$(MAKE) clean

	@# Make sure unit tests are run with stack canary
	@echo
	@echo "SIDE RELEASE BUILD: Building with HAVE_BOLOS_APP_STACK_CANARY"
	@echo
	@RELEASE_BUILD=0 NO_STACK_CANARY= $(MAKE) all

	@# Build release without stack canary
	@$(MAKE) clean
	@echo
	@echo "SIDE RELEASE BUILD: Building without HAVE_BOLOS_APP_STACK_CANARY"
	@echo
	@NO_STACK_CANARY=1 $(MAKE) all

	@echo "Packaging release... ledger-app-mina-$(VERSION_TAG).tar.gz"

	@echo "$$RELEASE_README" > README.txt

	@echo "$$RELEASE_DEPS" > install.sh
	@echo "python3 -m ledgerblue.loadApp $(APP_LOAD_PARAMS_EVALUATED)" >> install.sh
	@chmod +x install.sh

	@echo "$$RELEASE_DEPS" > uninstall.sh
	@echo "python3 -m ledgerblue.deleteApp $(APP_DELETE_PARAMS_EVALUATED)" > uninstall.sh
	@chmod +x uninstall.sh

	@cp utils/mina_ledger_wallet.py mina_ledger_wallet
	@sed -i 's/__version__ = "1.0.0"/__version__ = "$(VERSION_TAG)"/' mina_ledger_wallet
	@tar -zcf ledger-app-mina-$(VERSION_TAG).tar.gz \
	        --transform "s,^,ledger-app-mina-$(VERSION_TAG)/," \
	        README.txt \
	        install.sh \
	        uninstall.sh \
	        mina_ledger_wallet \
	        bin/app.hex
	@tar xzf ledger-app-mina-$(VERSION_TAG).tar.gz
	@zip -r ledger-app-mina-$(VERSION_TAG).zip ledger-app-mina-$(VERSION_TAG)/*
	@rm --preserve-root -rf ledger-app-mina-$(VERSION_TAG)
	@sha256sum ledger-app-mina-$(VERSION_TAG).tar.gz ledger-app-mina-$(VERSION_TAG).zip

	@rm -f README.txt
	@rm -f install.sh
	@rm -f uninstall.sh
	@rm -f mina_ledger_wallet

# Docker build targets (don't require BOLOS_SDK)
installers:
	@echo "Building all device variants and generating installers using Docker..."
	@./installer-builder/build.sh

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf build bin debug pkg installers
	@echo "Clean completed"

docker-clean:
	@echo "Cleaning Docker build artifacts..."
	@docker run --rm --user "$$(id -u):$$(id -g)" -v "$$(pwd):/app" ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest make clean
	@echo "Docker clean completed"
