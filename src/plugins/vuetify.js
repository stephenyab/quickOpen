import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import {VSnackbar, VBtn, VIcon} from 'vuetify/lib'
import VueMessageSnackbar from 'vuetify-message-snackbar'
import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify, {
    components: {
        VSnackbar,
        VBtn,
        VIcon
    }
})

Vue.use(VueMessageSnackbar)

export default new Vuetify({
    icons: {
        iconfont: 'mdi'
    }
});
