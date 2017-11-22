declare function require(path: string): any;

import Vue from "vue";
import Component from "vue-class-component";
import * as Neo from "../../common";
import { render } from "./components/creditData";
import "./creditDetail.scss";

const { plus, mui, plusReady, hideScroll, openPage, getCodeTable } = Neo;
const template = require("./creditDetail.html");

@Component({
    template,
    data() {
        return {
            loading: true
        };
    }
})
export class CreditDetail extends Vue {
    info: object | any = {
        navList: []
    };
    constructor() {
        super();
    }
    mounted() {
        Neo.setImmersed();
    }
}
const creditDetail: any = new CreditDetail().$mount("#creditDetail");

mui.init({
    swipeBack: true
});

plusReady((view) => {
    hideScroll();
    plus.navigator.setStatusBarStyle("light");
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        plus.navigator.setStatusBarStyle("dark");
        view.close();
    };

    creditDetail.info = { ...creditDetail.info, ...view.info };
    creditDetail.loading = false;
    const info = creditDetail.info;

    if (info.options && info.options.url) {
        Neo.$http("GET", info.options.url, {
            name: view.detail.companyName,
            sid: "ndt",
            ...info.options.param
        }).then((res: any) => {
            if (res.reCode === "00000") {
                const data = res.result[0];
                info.navList.length && info.navList.forEach((item, index) => {
                    info.navList.splice(index, 1, { ...item, data, component: render[info.pageName][item.comName], loading: false });
                });
                render[info.pageName] && render[info.pageName].success(res.result[0], creditDetail);
            } else {
                Neo.showMsg("获取企业信息失败" + res.reMsg);
            }
        });
    } else if (!info.options) {
        info.navList.forEach((item: any, index: number) => {
            Neo.$http("GET", item.url, {
                name: view.detail.companyName,
                sid: "ndt",
                ...item.param
            }).then((res: any) => {
                if (res.reCode === "00000" || res.reCode === "20006") {
                    info.navList.splice(index, 1, { ...item, data: res, component: render[info.pageName][item.comName], loading: false });
                } else {
                    Neo.showMsg(res.reMsg);
                    info.navList.splice(index, 1, { ...item, loading: false });
                }
            });
        });
    }
});
