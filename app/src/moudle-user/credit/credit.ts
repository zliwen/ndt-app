import CountUp from "countup.js";
import Vue from "vue";
import Component from "vue-class-component";
import * as Neo from "../../common";
import "./credit.scss";

declare function require(path: string): any;
const { plus, mui, plusReady, hideScroll, openPage } = Neo;
const userInfo = Neo.getSettings("user");
let demo: any;
const options = {
    useEasing: true,
    useGrouping: true,
    separator: ""
};

let taskItem: any = [{
    icon: "credit_icon_phcer@3x.png",
    page: "phoneAuth",
    color: { top: "#3EDA92", bottom: "#37D98E" }
}, {
    icon: "credit_icon_pecer@3x.png",
    page: "realAuth",
    color: { top: "#4AB9FC", bottom: "#58BDF8" }
}, {
    icon: "credit_icon_idcer@3x.png",
    page: "userInfo",
    color: { top: "#B37BFF", bottom: "#AE78F8" }
}, {
    icon: "credit_icon_agrcer@3x.png",
    color: { top: "#FF7865", bottom: "#FF8474" }
}, {
    icon: "credit_icon_upcer@3x.png",
    name: "信用分提升技巧",
    toLink: "保持良好的记录，提升活跃度，都可以提升信用额度",
    color: { top: "#FF902E", bottom: "#FF9435" }
}];

if (userInfo.userType === 203) {
    taskItem = [{
        icon: "credit_icon_pecer@3x.png",
        page: "userInfo",
        color: { top: "#4AB9FC", bottom: "#58BDF8" }
    }, {
        icon: "credit_icon_idcer@3x.png",
        page: "userInfo",
        color: { top: "#B37BFF", bottom: "#AE78F8" }
    }, {
        icon: "credit_icon_agrcer@3x.png",
        page: "realAuth",
        color: { top: "#FF7865", bottom: "#FF8474" }
    }, {
        icon: "credit_icon_phcer@3x.png",
        page: "phoneAuth",
        color: { top: "#3EDA92", bottom: "#37D98E" }
    }, {
        icon: "credit_icon_upcer@3x.png",
        name: "信用分提升技巧",
        toLink: "保持良好的记录，提升活跃度，都可以提升信用额度",
        color: { top: "#FF902E", bottom: "#FF9435" }
    }];
}

@Component({
    template: require("./credit.html"),
    watch: {
        score(newVal, oldVal) {
            demo.update(newVal);
        }
    },
    methods: {
        toCreditAbout: openPage,
        openPage(id, params) {
            // if (params.state) {
            //     return mui.toast("认证已完成");
            // }
            if (id) {
                openPage(id, params);
            } else {
                return mui.toast("认证信息完善中...");
            }
        }
    }
})
export class Credit extends Vue {
    score: number = 0;
    taskList: object[] = [];
    constructor() {
        super();
    }
    mounted() {
        Neo.setImmersed();
        demo = new CountUp("numberAnimate", 0, 0, 0, 1.5, options);
        if (!demo.error) {
            demo.start();
        } else {
            console.error(demo.error);
        }
    }
}

const credit = new Credit().$mount("#credit");

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
            credit.score = res.data.totalScore;
        } else {
            Neo.showError(res.errorCode, "获取信用分数失败");
        }
    }).catch(() => {
        mui.toast("获取信用分数失败");
        credit.score = 1024;
    });

    Neo.$http("POST", "creditTask/list/1/10").then((res: any) => {
        if (!res.errorCode && res.data && res.data.pageData) {
            res.data.pageData.forEach((item, index) => {
                item = { ...item, ...taskItem[index] };
                credit.taskList.splice(index, 1, item);
            });
            credit.taskList.splice(taskItem.length - 1, 1, taskItem[taskItem.length - 1]);
        } else {
            Neo.showError(res.errorCode, "获取认证列表失败");
        }
    }).catch(() => {
        mui.toast("获取认证列表失败");
    });
}
// 初始化数据
init();
