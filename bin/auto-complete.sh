# Usage:
#
# 1. Make sure the following lines is in your .zshrc
# autoload -U compinit
# compinit
#
# 2. Run `source ./bin/auto-complete.sh`
# 
# 3. Input `./bin/test.ts` and press <Tab>

compdef _test test-php.ts
compdef _test test-js.ts
compdef _test render.ts
compdef _test compile-to-js.ts
compdef _test compile-to-php.ts
compdef _test render.php

function _test {
    local line

    _arguments -C \
        "-h[Show help information]" \
        "--h[Show help information]" \
        "1: :($(ls test/cases))"
}