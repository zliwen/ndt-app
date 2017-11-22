declare function require(path: string): any;

import Vue from "vue";
import * as Neo from "../../common";
import NetStatus from "../../components/netStatus/netStatus";
import "./userInfo.scss";

// 图像上传裁切指令
import "../../directives/imgCropper";

import "../../../../assets/js/mui.picker.min.js";

const { plus, mui, plusReady, hideScroll, openPage, getCodeTable } = Neo;
const template = require("./userInfo.html");

const userData = Neo.getSettings("user");

mui.init({
    swipeBack: true
});

// 性别选择
const genderPicker = new mui.PopPicker();
const genderPickData: object[] = [];
getCodeTable(1, (result) => {
    result.forEach((item) => {
        genderPickData.push({
            value: item.id,
            text: item.value
        });
    });
    genderPicker.setData(genderPickData);
});
genderPicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    userInfo.info = { ...userInfo.info, genderName: item[0].text, gender: item[0].value };
};

// 学历选择
const educationPicker = new mui.PopPicker();
const educationData: object[] = [];
getCodeTable(12, (result) => {
    result.forEach((item) => {
        educationData.push({
            value: item.id,
            text: item.value
        });
    });
    educationPicker.setData(educationData);
});
educationPicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    userInfo.info = { ...userInfo.info, educationName: item[0].text, education: item[0].value };
};

// 婚姻状况选择
const maritalStatusPicker = new mui.PopPicker();
const maritalStatusData: object[] = [];
getCodeTable(10, (result) => {
    result.forEach((item) => {
        maritalStatusData.push({
            value: item.id,
            text: item.value
        });
    });
    maritalStatusPicker.setData(maritalStatusData);
});
maritalStatusPicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    userInfo.info = { ...userInfo.info, maritalStatusName: item[0].text, maritalStatus: item[0].value };
};

// 城市选择
const cityPicker = new mui.PopPicker();
cityPicker.setData([
    { value: 5101, text: "成都市" }
]);
cityPicker.pickers[0].setSelectedValue(5101);
cityPicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    userInfo.address = { ...userInfo.address, city: item[0].text };
    getDataById(item[0].value, (data) => {
        countyPicker.setData(data);
    });
};

// 区县选择
const countyPicker = new mui.PopPicker();
countyPicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    townPicker.setData([]);
    villagePicker.setData([]);
    userInfo.address = { ...userInfo.address, county: item[0].text, town: "", village: "" };
    getDataById(item[0].value, (data) => {
        townPicker.setData(data);
    });
};

// 乡镇选择器
const townPicker = new mui.PopPicker();
townPicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    villagePicker.setData([]);
    userInfo.address = { ...userInfo.address, town: item[0].text, village: "" };
    getDataById(item[0].value, (data) => {
        villagePicker.setData(data);
    });
};

// 村/社区选择器
const villagePicker = new mui.PopPicker();
villagePicker.showCb = (item) => {
    userInfo.address = { ...userInfo.address, village: item[0].text };
    console.log(item[0].text + ":" + item[0].value);
};

const picker = {
    genderPicker,
    educationPicker,
    maritalStatusPicker,
    cityPicker,
    countyPicker,
    townPicker,
    villagePicker
};

function getDataById(id, cb) {
    mui.get(Neo.REMOTE + "division/children/" + id, {}, (res: any) => {
        if (res.errorCode === 0) {
            if (res.data.length) {
                const data: object[] = [];
                res.data.forEach((item) => {
                    data.push({
                        value: item.id,
                        text: item.name
                    });
                });
                cb && cb(data);
            }
        } else {
            Neo.showMsg("区域ID返回错误");
        }
    }, "json");
}

function getUserInfo() {
    Neo.$http("GET", "person/findByUserId", {
        userId: userData.userId
    }).then((res: any) => {
        if (!res.errorCode) {
            genderPicker.pickers[0].setSelectedValue(res.data.gender);
            maritalStatusPicker.pickers[0].setSelectedValue(res.data.maritalStatus);
            educationPicker.pickers[0].setSelectedValue(res.data.education);
            userInfo.info = {
                ...res.data,
                genderName: Neo.getUnit(1, res.data.gender),
                educationName: Neo.getUnit(12, res.data.education),
                maritalStatusName: Neo.getUnit(10, res.data.maritalStatus)
            };
        } else {
            Neo.showError(res.errorCode, "获取信息失败");
        }
        userInfo.loading = false;
    }).catch(() => {
        userInfo.loading = "fail";
    });
    Neo.getDivision(userData.adminDivisionId, (data) => {
        userInfo.division = data.fullName;
    });
}
getUserInfo();

plusReady((view) => {
    hideScroll();
    Neo.setCloseBarStyle(view);
    window.addEventListener("reloadData", (ev: any) => {
        getUserInfo();
    });
});

interface IProductDetail {
    bannerImg: string;
    info: object | any;
    address: object;
    loading: boolean;
    avatar: string;
    adminDivisionId: number;
    division: string;
}

const userInfo: any = new Vue({
    el: "#userInfo",
    template,
    data(): IProductDetail {
        return {
            bannerImg: "assets/images/ndt/status_progress.jpg",
            info: null,
            address: {},
            loading: true,
            avatar: "",
            adminDivisionId: userData.adminDivisionId,
            division: ""
        };
    },
    computed: {
        imageUrl() {
            return userInfo.info.imageUrl ? Neo.REMOTE + "file/download/" + userInfo.info.imageUrl : "";
        }
    },
    components: {
        "net-status": NetStatus
    },
    watch: {
        address(newValue, oldValue) {
            if (newValue.county === "市辖区") {
                newValue.town = "";
                newValue.village = "";
            }
            userInfo.getPickerVal();
            console.log(userInfo.adminDivisionId);
        }
    },
    methods: {
        getUnit: Neo.getUnit,
        showPage(id: string) {
            openPage(id);
        },
        reload() {
            getUserInfo();
        },
        avatarChange(newAvatar, type, id) {
            userInfo.info = { ...userInfo.info, imageUrl: id };
        },
        getPickerVal() {
            userInfo.adminDivisionId = picker.villagePicker.getSelectedItems()[0].value
                || picker.townPicker.getSelectedItems()[0].value
                || picker.countyPicker.getSelectedItems()[0].value
                || picker.cityPicker.getSelectedItems()[0].value;
            // 获取当前区域信息
            Neo.getDivision(userInfo.adminDivisionId, (data) => {
                userInfo.division = data.fullName;
            });
            // userInfo.info.address = (picker.cityPicker.getSelectedItems()[0].text || "") +
            //     (picker.countyPicker.getSelectedItems()[0].text || "") +
            //     (picker.townPicker.getSelectedItems()[0].text || "") +
            //     (picker.villagePicker.getSelectedItems()[0].text || "");
        },
        showPicker(pickerName) {
            picker[pickerName].show(picker[pickerName].showCb);
        },
        saveInfo() {
            if (userInfo.info.identityId && !(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/.test(userInfo.info.identityId))) {
                return mui.toast("请填写正确的身份证号");
            }
            if (userInfo.info.name && userInfo.info.name.length <= 1) {
                return mui.toast("请填写正确的姓名");
            }
            const { city, county, town, village } = userInfo.address;
            const params = {
                adminDivisionId: userInfo.adminDivisionId,
                imageUrl: userInfo.info.imageUrl,
                name: userInfo.info.name,
                address: userInfo.info.address,
                identityId: userInfo.info.identityId,
                gender: userInfo.info.gender,
                education: userInfo.info.education,
                maritalStatus: userInfo.info.maritalStatus,
                supportNum: userInfo.info.supportNum,
                monitorChildren: userInfo.info.monitorChildren
            };
            console.log(JSON.stringify(params));
            plus.nativeUI.showWaiting("用户资料保存中...");
            Neo.$http("POST", "person/update", params).then((res: any) => {
                if (!res.errorCode) {
                    userData.adminDivisionId = userInfo.adminDivisionId || userInfo.info.adminDivisionId;
                    Neo.setSettings("user", userData);
                    const user = plus.webview.getWebviewById("user");
                    const news = plus.webview.getWebviewById("news.html");
                    mui.fire(user, "reloadData", {});
                    mui.fire(news, "reloadData", {});
                    mui.later(() => {
                        plus.nativeUI.closeWaiting();
                        mui.back();
                    }, 1000);
                } else {
                    Neo.showError(res.errorCode, res.data || "保存失败");
                    console.log(JSON.stringify(res));
                    plus.nativeUI.closeWaiting();
                }
            }).catch(() => {
                plus.nativeUI.closeWaiting();
            });
        }
    },
    mounted() {
        Neo.setImmersed();
    }
});
