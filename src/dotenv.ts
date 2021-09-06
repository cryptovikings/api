import dotenvsafe from 'dotenv-safe';

/**
 * Load the dotenv config w/ example for runtime safety
 *
 * Module designed to be passed directly to Node for pre-execution inclusion with the `-r` flag
 */
dotenvsafe.config({
    path: `${__dirname}/../.env`,
    example: `${__dirname}/../.env.example`,
    allowEmptyValues: true
});
