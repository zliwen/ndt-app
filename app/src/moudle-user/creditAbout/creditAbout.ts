import CountUp from "countup.js";
import Vue from "vue";
import Component from "vue-class-component";
import * as Neo from "../../common";
import "./creditAbout.scss";

declare function require(path: string): any;
const { plus, mui, plusReady, hideScroll, openPage } = Neo;
const userInfo = Neo.getSettings("user");
let demo: any;
const options = {
    useEasing: true,
    useGrouping: true,
    separator: ""
};

@Component({
    template: require("./creditAbout.html"),
    watch: {
        score(newVal, oldVal) {
            demo.update(newVal);
        }
    }
})
export class CreditAbout extends Vue {
    score: number = 0;
    constructor() {
        super();
    }
    mounted() {
        Neo.setImmersed();
        // demo = new CountUp("numberAnimate", 0, 0, 0, 1.5, options);
        // if (!demo.error) {
        //     demo.start();
        // } else {
        //     console.error(demo.error);
        // }
    }
}

const creditAbout = new CreditAbout().$mount("#creditAbout");

plusReady((view) => {
    hideScroll();
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        view.close();
    };
    window.addEventListener("reloadData", (ev: any) => {
        init();
    });
});

function init() {
    Neo.$http("GET", "userCredit/findByUserId").then((res: any) => {
        if (!res.errorCode && res.data) {
            creditAbout.score = res.data.totalScore;
        } else {
            Neo.showError(res.errorCode, "获取信用分数失败");
        }
    }).catch(() => {
        mui.toast("获取信用分数失败");
        creditAbout.score = 1024;
    });
}
// 初始化数据
init();
