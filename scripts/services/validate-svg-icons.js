const { DOMParser } = require('xmldom');

/**
 * Parses the SVG string into an SVG DOM object.
 *
 * @param {string} svgIcon - The SVG string to parse.
 * @param {string} serviceId - The service id, which is displayed in case of an error.
 * @returns {object} The parsed SVG DOM object.
 * @throws {Error} If there is an SVG syntax error, an error is thrown.
 */
const parseSVG = (svgIcon, serviceId) => {
    const parser = new DOMParser({ locator: {}, errorHandler: {} });
    try {
        const SVGObject = parser.parseFromString(svgIcon);
        return SVGObject;
    } catch (error) {
        throw new Error(`Invalid SVG for the service with id: '${serviceId}`);
    }
};

/**
 * Parses an SVG string and checks its syntax.
 *
 * @param {string} svgIcon - The SVG string to parse.
 * @param {string} serviceId - The name of the service associated with the SVG.
 * @returns {Array<string>} - Returns error message array.
 */
const checkSVG = (svgIcon, serviceId) => {
    // Array to collect errors.
    const svgErrors = [];
    const svgNode = parseSVG(svgIcon, serviceId);
    // Check if the first child node of the parsed SVG object is undefined
    // or does not have the 'svg' nodeName. If so, the error is written to an array.
    if (!svgNode.childNodes[0].nodeName || svgNode.childNodes[0].nodeName !== 'svg') {
        svgErrors.push(`${serviceId} : Parsed SVG object is undefined`);
    }
    const svgDocumentElement = svgNode.documentElement;
    // Checks if the SVG is square by comparing the viewBox dimensions.
    // If the SVG is not square, the error is written to an array.
    const svgViewBox = svgDocumentElement.getAttribute('viewBox').split(' ');
    if (svgViewBox[2] !== svgViewBox[3]) {
        svgErrors.push(`${serviceId} : The icon must have a square shape.`);
    }
    // Checks if the SVG tag contains 'width' and 'height' attributes.
    // If 'width' or 'height' attributes are present, the error is written to an array.
    if (svgDocumentElement.hasAttribute('height') || svgDocumentElement.hasAttribute('width')) {
        svgErrors.push(`${serviceId} : Svg tag must not contain 'width' and 'height' attributes`);
    }
    // Checks if the SVG tag contains 'fill="currentColor"' attribute.
    // If the 'fill' attribute is missing or not set to 'currentColor', the error is written to an array.
    if (!svgDocumentElement.hasAttribute('fill') || svgDocumentElement.getAttribute('fill') !== 'currentColor') {
        svgErrors.push(`${serviceId} : Svg tag must contain 'fill="currentColor"' attribute.`);
    }
    return svgErrors;
};

/**
 * Checks that all services have valid SVG icons.
 *
 * @param {Array<object>} servicesArray - An array of service data objects.
 * @throws An error if any service has an invalid SVG icon.
 * The error message contains details for all of the invalid SVG icons.
 */
const validateSvgIcons = (servicesArray) => {
    // Array with results of svg validation.
    const errorReports = [];
    // Collects error messages into an array
    servicesArray.forEach((service) => {
        const errors = checkSVG(service.icon_svg, service.id);
        if (errors.length > 0) {
            errorReports.push(...errors);
        }
    });
    if (errorReports.length > 0) {
        throw new Error(`\n${errorReports.join('\n')}`);
    }
};

module.exports = { validateSvgIcons };
