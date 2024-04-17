export class XMLSanitizerUtil {
    static sanitize(input) {
        return input
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('&', '&amp;')
            .replace("'", '&#39;')
            .replace("/", '&#x2F;');
    }
}