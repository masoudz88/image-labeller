import MobileDetect from 'mobile-detect'

export class PlatformUtil {
    static getMobileDeviceData(userAgent) {
        const mobileDetect = new MobileDetect(userAgent);
        return {
            manufacturer: mobileDetect.mobile(),
            browser: mobileDetect.userAgent(),
            os: mobileDetect.os()
        };
    }

    static isMac(userAgent) {
        return !!userAgent.toLowerCase().match("mac");
    }

    static isSafari(userAgent) {
        return !!userAgent.toLowerCase().match("safari");
    }

    static isFirefox(userAgent) {
        return !!userAgent.toLowerCase().match("firefox");
    }
}