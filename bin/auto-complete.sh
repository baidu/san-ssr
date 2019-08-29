# Usage:
#
# 1. Make sure the following lines is in your .zshrc
# autoload -U compinit
# compinit
#
# 2. Run `source ./bin/auto-complete.sh`
# 
# 3. Input `./bin/test.js` and press <Tab>

compdef _test test.js
compdef _test render.js
compdef _test render.php

function _test {
    local line

    _arguments -C \
        "-h[Show help information]" \
        "--h[Show help information]" \
        "1: :($(ls test/cases))"
}