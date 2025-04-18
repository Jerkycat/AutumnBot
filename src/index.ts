import { logger } from '@class/Logger';
import { config } from 'dotenv';
config();
logger.start();

import Core from '@core';

const Yumu = new Core();

process.on('uncaughtException', err => {
    logger.error('Erro crítico não tratado: ' + err, 'System');
    setTimeout(() => {
        logger.log('Reiniciando o bot...');
        process.exit(1);
    }, 3000);
});

process.on('unhandledRejection', reason => {
    logger.error('Rejeição não tratada: ' + reason, 'System');
});
