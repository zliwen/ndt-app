import CountUp from "countup.js";
import Vue from "vue";
import Component from "vue-class-component";
import * as Neo from "../../common";
import "./userProfile.scss";

declare function require(path: string): any;
const { plus, mui, plusReady, hideScroll, openPage, replaceNum } = Neo;
const userInfo = Neo.getSettings("user");

function getUserInfo() {
    let url = "person/findByUserId";
    if (userInfo.userType === 203) {
        url = "front/company/detail/" + userInfo.userId;
    }
    Neo.$http("GET", url, {
        userId: userInfo.userId
    }).then((res: any) => {
        if (!res.errorCode) {
            userProfile.name = res.data.name || res.data.legalPerson;
            userProfile.loginName = res.data.name;
            userProfile.identityId = res.data.identityId || res.data.legalPersonIdentityId;
        } else {
            Neo.showError(res.errorCode, "获取信息失败");
        }
    });
}

function getTaskList() {
    Neo.$http("POST", "creditTask/list/1/10").then((res: any) => {
        if (!res.errorCode && res.data && res.data.pageData) {
            userProfile.phoneAuth = res.data.pageData[0];
            userProfile.realAuth = res.data.pageData[1];
        } else {
            Neo.showError(res.errorCode, "获取认证列表失败");
        }
    }).catch(() => {
        mui.toast("获取认证列表失败");
    });
}

getUserInfo();
getTaskList();

@Component({
    template: require("./userProfile.html"),
    methods: {
        openPage,
        replaceNum
    }
})
export class UserProfile extends Vue {
    phoneAuth = null;
    realAuth = null;
    name = "";
    identityId = "";
    loginName = "";
    userType = userInfo.userType;
    constructor() {
        super();
    }
    reload() {
        getUserInfo();
    }
    mounted() {
        Neo.setImmersed();
    }
}

const userProfile = new UserProfile().$mount("#userProfile");

plusReady((view) => {
    hideScroll();
    Neo.setCloseBarStyle(view);
    window.addEventListener("reloadData", (ev: any) => {
        getUserInfo();
        getTaskList();
    });
});