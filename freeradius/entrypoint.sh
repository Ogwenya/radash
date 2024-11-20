#!/bin/bash

# List of modules to enable
MODULES_TO_ENABLE=("sql")

# Create symlinks
for module in "${MODULES_TO_ENABLE[@]}"; do
    if [ -f "/etc/raddb/mods-available/$module" ]; then
        ln -sf "/etc/raddb/mods-available/$module" "/etc/raddb/mods-enabled/$module"
        echo "Created symlink for $module"
    else
        echo "Warning: Module $module not found in mods-available"
    fi
done

# Execute the main container command
exec "$@"