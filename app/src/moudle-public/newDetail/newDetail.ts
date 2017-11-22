declare function require(path: string): any;

import Vue from "vue";
import Component from "vue-class-component";
import * as Neo from "../../common";
import "./newDetail.scss";

const { plus, mui, plusReady, hideScroll, openPage } = Neo;
const template = require("./newDetail.html");

mui.init({
    swipeBack: true
});

@Component({
    template,
    filters: {
        format: Neo.timeFormat
    }
})
class NewDetail extends Vue {
    detail = null;
    content = null;
    type = "";
    loading = false;
    mounted() {
        Neo.setImmersed();
    }
}

const newDetail = new NewDetail().$mount("#newDetail");

plusReady((view) => {
    hideScroll();
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        view.close();
    };
    newDetail.detail = { ...view.detail };
    newDetail.type = view.type;

    let url = "";
    if (view.type === "info") {
        url = "front/info/detail";
    } else if (view.type === "policy") {
        url = "front/policy/detail";
    }

    url && Neo.$http("GET", url, {
        id: view.detail.id
    }).then((res: any) => {
        if (!res.errorCode && res.data) {
            newDetail.content = res.data.content;
            newDetail.loading = false;
        }
    }).catch(() => {
        newDetail.loading = false;
    });
});