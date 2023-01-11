# shellcheck disable=SC1091,SC2155

# SOURCE THIS FILE
# . prepare-devenv s|x

if [ $# -ne 1 ]; then
    echo "Possible options: s or x"
    return
elif [[ $1 == "-h" ]]; then
    echo "Possible options: s or x"
    return
    echo "Possible options: s or x"
elif [[ $1 != "s" ]] && [[ $1 != "x" ]]; then
    return
fi

export NANO_MODEL="nano$1"

if [[ $(dpkg-query -s python3-venv 2>&1) == *'is not installed'* ]]; then
    printf "\nPackage python3-venv is missing.\nOn Debian-like distros, run:\n\napt install python3-venv\n\n"
    return
fi

if [[ $(cat /etc/udev/rules.d/20-hw1.rules) == *'ATTRS{idVendor}=="2c97", ATTRS{idProduct}=="0004"'* ]]; then
    printf "\nMissing udev rules. Please refer to https://support.ledger.com/hc/en-us/articles/115005165269-Fix-connection-issues\n\n"
    return
fi


if [ ! -d dev-env/SDK ] ; then
    mkdir dev-env/SDK
    mkdir dev-env/CC
    mkdir dev-env/CC/others
    mkdir dev-env/CC/nanox

    wget 'https://armkeil.blob.core.windows.net/developer/Files/downloads/gnu-rm/10.3-2021.10/gcc-arm-none-eabi-10.3-2021.10-x86_64-linux.tar.bz2'
    tar xf gcc-arm-none-eabi-10.3-2021.10-x86_64-linux.tar.bz2
    rm gcc-arm-none-eabi-10.3-2021.10-x86_64-linux.tar.bz2
    mv gcc-arm-none-eabi-10.3-2021.10 dev-env/CC/nanox/
    ln -s ../nanox/gcc-arm-none-eabi-10.3-2021.10 dev-env/CC/others/

    wget 'https://github.com/llvm/llvm-project/releases/download/llvmorg-10.0.0/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04.tar.xz' -O clang+llvm.tar.xz
    tar xf clang+llvm.tar.xz
    rm clang+llvm.tar.xz
    mv clang+llvm* dev-env/CC/nanox/clang-arm-fropi
    ln -s ../nanox/clang-arm-fropi dev-env/CC/others/

    wget 'https://github.com/LedgerHQ/nanos-secure-sdk/archive/refs/tags/2.1.0.tar.gz' -O nanos-secure-sdk.tar.gz
    tar xf nanos-secure-sdk.tar.gz
    rm nanos-secure-sdk.tar.gz
    mv nanos-secure-sdk* dev-env/SDK/nanos-secure-sdk

    wget 'https://github.com/LedgerHQ/nanox-secure-sdk/archive/refs/tags/2.0.2.tar.gz' -O nanox-secure-sdk.tar.gz
    tar xf nanox-secure-sdk.tar.gz
    rm nanox-secure-sdk.tar.gz
    mv nanox-secure-sdk* dev-env/SDK/nanox-secure-sdk

    python3 -m venv dev-env/ledger_py3
    source dev-env/ledger_py3/bin/activate
    pip install wheel
    pip install ledgerblue
fi


source dev-env/ledger_py3/bin/activate

if [[ $1 == "s" ]]; then
    export BOLOS_SDK=$(pwd)/dev-env/SDK/nanos-secure-sdk
    export BOLOS_ENV=$(pwd)/dev-env/CC/others
elif [[ $1 == "x" ]]; then
    export BOLOS_SDK=$(pwd)/dev-env/SDK/nanox-secure-sdk
    export BOLOS_ENV=$(pwd)/dev-env/CC/nanox
fi

export PS1="$(echo $PS1 | sed 's/ledger_py3/ledger_py3, ${NANO_MODEL}/g') "
