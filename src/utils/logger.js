/**
 * Logger profesional con Winston
 * 
 * - Development: formato colorido y legible en consola
 * - Production: formato JSON estructurado + archivo de logs
 * - Test: silenciado para no ensuciar output de tests
 */

const winston = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Formato legible para desarrollo
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
});

// Crear logger según entorno
const createLogger = () => {
    const env = process.env.NODE_ENV || 'development';

    // En tests: silenciar todo
    if (env === 'test') {
        return winston.createLogger({
            silent: true
        });
    }

    const transports = [];

    // Consola siempre activa (dev y prod)
    if (env === 'development') {
        transports.push(
            new winston.transports.Console({
                format: combine(
                    colorize({ all: true }),
                    timestamp({ format: 'HH:mm:ss' }),
                    errors({ stack: true }),
                    devFormat
                )
            })
        );
    } else {
        // Production: JSON en consola (para Docker/CloudWatch/etc.)
        transports.push(
            new winston.transports.Console({
                format: combine(
                    timestamp(),
                    errors({ stack: true }),
                    json()
                )
            })
        );

        // Production: archivo de errores
        transports.push(
            new winston.transports.File({
                filename: path.join('logs', 'error.log'),
                level: 'error',
                maxsize: 5242880, // 5MB
                maxFiles: 5,
                format: combine(
                    timestamp(),
                    errors({ stack: true }),
                    json()
                )
            })
        );

        // Production: archivo combinado
        transports.push(
            new winston.transports.File({
                filename: path.join('logs', 'combined.log'),
                maxsize: 5242880, // 5MB
                maxFiles: 5,
                format: combine(
                    timestamp(),
                    errors({ stack: true }),
                    json()
                )
            })
        );
    }

    return winston.createLogger({
        level: env === 'development' ? 'debug' : 'info',
        defaultMeta: { service: 'reservas-api' },
        transports
    });
};

const logger = createLogger();

module.exports = logger;
