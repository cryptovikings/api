#!/bin/bash

source /root/.bashrc

cd /home/ec2-user

# update packages
sudo yum -y update
sudo yum -y upgrade

# install screen if not present
if ! which screen > /dev/null; then
    sudo yum -y install screen
fi

# install + enable MongoDB if not present
if ! which mongo > /dev/null; then
    echo "
[mongodb-org-4.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/4.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc" > /etc/yum.repos.d/mongodb-org-4.4.repo

    sudo yum -y install mongodb-org

    sudo systemctl enable mongod
fi

# start MongoDB
sudo systemctl start mongod

# install node if not present
if ! which node > /dev/null; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

    . ~/.nvm/nvm.sh

    nvm install node
fi

# install libpng + libpng-devel if not present
if ! yum list | grep libpng > /dev/null; then
    sudo yum -y install libpng libpng-devel
fi

# install graphicsmagick if not present
if ! which gm > /dev/null; then
    cd /home/ec2-user

    wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/1.3/GraphicsMagick-1.3.15.tar.gz

    tar -xvf GraphicsMagick-1.3.15.tar.gz

    cd GraphicsMagick-1.3.15

    ./configure

    make

    sudo make install

    # clean up
    cd ..
    rm -rf GraphicsMagick-1.3.15
    rm GraphicsMagick-1.3.15.tar.gz
fi
