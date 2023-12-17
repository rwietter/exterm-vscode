#!/bin/bash

# Obtém o caminho do diretório do primeiro workspace do VS Code
WORKSPACE_PATH="$(jq -r '.folders[0].uri' <<< $(code --list-workspaces))"

# Navega até o diretório do workspace
cd "$WORKSPACE_PATH" || exit

# Abre o WezTerm
wezterm
