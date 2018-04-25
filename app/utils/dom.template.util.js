import { get as getFrom } from './promisified.request.util.js';
import { stringToHtml } from './dom.general.util.js';

export default (url) => getFrom(url).then(stringToHtml);