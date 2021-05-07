environment
    install mongodb from custom repo
        enable + start mongod

    install nvm + node

    install developer tools
        sudo yum groupinstall "Development Tools"

    install libpng
        sudo yum install libpng libpng-devel

    install graphicsmagick
        https://gist.github.com/pzaich/3997914




deploy (to /home/ec2-user/api/)
    API dist output
    .env + .env.example
    package.json

    npm install --production



run (foreground)
    node -r /home/ec2-user/api/dotenv.js /home/ec2-user/api/api.js

