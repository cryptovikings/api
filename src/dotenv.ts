import dotenvsafe from 'dotenv-safe';

dotenvsafe.config({
    path: `${__dirname}/.env`,
    example: `${__dirname}/.env.example`
});
