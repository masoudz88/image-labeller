export class EnvironmentUtil {
    static isDev() {
        return process.env.NODE_ENV === 'development';
    }

    static isProd() {
        return process.env.NODE_ENV === 'production';
    }
}