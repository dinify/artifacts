#!/bin/zsh

echo -e "\n. $(brew --prefix asdf)/asdf.sh" >> ~/.zshrc
echo -e "\n. $(brew --prefix asdf)/etc/bash_completion.d/asdf.bash" >> ~/.zshrc

brew install \
  coreutils automake autoconf openssl \
  libyaml readline libxslt libtool unixodbc \
  unzip curl

# brew install deno

asdf plugin-add deno https://github.com/asdf-community/asdf-deno.git

asdf install deno 0.2.10

# Activate globally with:
asdf global deno 0.2.10