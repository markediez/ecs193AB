#!/bin/bash

echo "Installing Ruby..."
sudo apt install ruby
sudo apt install ruby-dev

echo "Installing libraries..."
sudo apt-get install libssl-dev
sudo apt-get install libgmp3-dev
sudo apt-get install gcc
sudo apt-get install make

echo "Installing Sinatra..."
sudo gem install sinatra
sudo gem install sinatra-websocket

echo "Installing Puma..."
sudo gem install thin

echo "Installing other gems..."
sudo gem install digest
sudo gem install data_uri
sudo gem install json
sudo gem install sass
sudo gem install yaml
