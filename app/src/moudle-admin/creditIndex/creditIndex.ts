declare function require(path: string): any;

import Vue from "vue";
import Component from "vue-class-component";
import * as Neo from "../../common";
import "./creditIndex.scss";
import { creditData } from "./creditInfo";

const { plus, mui, plusReady, hideScroll, openPage, getCodeTable } = Neo;
const template = require("./creditIndex.html");
@Component({
    template,
    data() {
        return {
            detail: {},
            creditData,
            paddingTop: Neo.getImmersed() + Math.ceil(Neo.getRootSize() * .15) + "px"
        };
    }
})
export class CreditIndex extends Vue {
    constructor() {
        super();
    }
    getIcon(icon) {
        return "url(assets/images/ndt/" + (icon || "se_btn_jz@3x.png") + ")";
    }
    open(id, detail, info) {
        openPage(id, {
            detail,
            info
        });
    }
    back() {
        mui.back();
    }
    mounted() {
        Neo.setImmersed();
    }
}
const creditIndex: any = new CreditIndex().$mount("#creditIndex");

mui.init({
    swipeBack: true
});

plusReady((view) => {
    hideScroll();
    plus.navigator.setStatusBarStyle("dark");
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        plus.navigator.setStatusBarStyle("light");
        view.close();
    };
    creditIndex.detail = view.detail;
});
