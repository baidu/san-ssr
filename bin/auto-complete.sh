# Usage:
#
# 1. Make sure the following lines is in your .zshrc
# autoload -U compinit
# compinit
#
# 2. Run `source ./bin/auto-complete.sh`
# 
# 3. Input `./bin/render.js` and press <Tab>

compdef _render render.js

function _render {
    local line

    _arguments -C \
        "-h[Show help information]" \
        "--h[Show help information]" \
        "1: :($(ls test/cases))"
}