import {
    OVERLAY_CLICKED,
} from '../../constants/channels.js';

import getTemplate from '../../utils/dom.template.util.js';
import { notify, subscribe as observeMessages } from '../../helpers/message-bus.helper.js';

// init function
export default () =>
    getTemplate('/app/view-controllers/overlay/view.html')
        .then(($view) => {
            const $overlay = $view.querySelector('.jsOverlay');

            // user interaction _______________________________________________________________________________________
            $overlay.addEventListener('click', () => {
                notify(OVERLAY_CLICKED, true);
            });

            return $view;
        });