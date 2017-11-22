declare function require(path: string): any;

import Vue from "vue";
import * as Neo from "../../common";
import NetStatus from "../../components/netStatus/netStatus";
import "./companyInfo.scss";

// 图像上传裁切指令
import "../../directives/imgCropper";

import "../../../../assets/js/mui.picker.min.js";
import "../../../../assets/js/mui.poppicker.js";

const { plus, mui, plusReady, hideScroll, openPage, getCodeTable } = Neo;
const template = require("./companyInfo.html");

const userData = Neo.getSettings("user");

mui.init({
    swipeBack: true
});

// 公司类型选择
const companyTypePicker = new mui.PopPicker();
const companyTypeData: object[] = [];
getCodeTable(16, (result) => {
    result.forEach((item) => {
        companyTypeData.push({
            value: item.id,
            text: item.value
        });
    });
    companyTypePicker.setData(companyTypeData);
});
companyTypePicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    companyInfo.info = { ...companyInfo.info, companyTypeName: item[0].text, companyType: item[0].value };
};

// 行业类型选择
const industryTypePicker = new mui.PopPicker();
const industryTypeData: object[] = [];
getCodeTable(17, (result) => {
    result.forEach((item) => {
        industryTypeData.push({
            value: item.id,
            text: item.value
        });
    });
    industryTypePicker.setData(industryTypeData);
});
industryTypePicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    companyInfo.info = { ...companyInfo.info, industryTypeName: item[0].text, industryType: item[0].value };
};

// 成立时间
const setupTimePicker = new mui.DtPicker({
    type: "date",
    beginYear: 1900,
    endYear: new Date().getUTCFullYear()
});
setupTimePicker.showCb = (item) => {
    console.log(JSON.stringify(item));
    companyInfo.info = { ...companyInfo.info, setupTime: new Date(item.text).getTime(), setupTimeStr: item.text };
};

// 城市选择
const cityPicker = new mui.PopPicker();
cityPicker.setData([
    { value: 5101, text: "成都市" }
]);
cityPicker.pickers[0].setSelectedValue(5101);
cityPicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    companyInfo.address = { ...companyInfo.address, city: item[0].text };
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
    companyInfo.address = { ...companyInfo.address, county: item[0].text, town: "", village: "" };
    getDataById(item[0].value, (data) => {
        townPicker.setData(data);
    });
};

// 乡镇选择器
const townPicker = new mui.PopPicker();
townPicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    villagePicker.setData([]);
    companyInfo.address = { ...companyInfo.address, town: item[0].text, village: "" };
    getDataById(item[0].value, (data) => {
        villagePicker.setData(data);
    });
};

// 村/社区选择器
const villagePicker = new mui.PopPicker();
villagePicker.showCb = (item) => {
    companyInfo.address = { ...companyInfo.address, village: item[0].text };
    console.log(item[0].text + ":" + item[0].value);
};

const picker = {
    companyTypePicker,
    industryTypePicker,
    setupTimePicker,
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
    Neo.$http("GET", "front/company/detail/" + userData.userId, {
        userId: userData.userId
    }).then((res: any) => {
        if (!res.errorCode) {
            companyTypePicker.pickers[0].setSelectedValue(res.data.companyType);
            industryTypePicker.pickers[0].setSelectedValue(res.data.industryType);
            const relatedImgUrls = JSON.parse(res.data.relatedImgUrls);
            companyInfo.info = {
                ...res.data,
                userType: userData.userType,
                positive: relatedImgUrls[0], negative: relatedImgUrls[1], licence: relatedImgUrls[2],
                setupTimeStr: Neo.timeFormat(res.data.setupTime, "yyyy-MM-dd"),
                companyTypeName: Neo.getUnit(16, res.data.companyType),
                industryTypeName: Neo.getUnit(17, res.data.industryType)
            };
        } else {
            Neo.showError(res.errorCode, "获取信息失败");
        }
        companyInfo.loading = false;
    }).catch(() => {
        companyInfo.loading = "fail";
    });
    Neo.getDivision(userData.adminDivisionId, (data) => {
        companyInfo.division = data.fullName;
    });
}
getUserInfo();

plusReady((view) => {
    hideScroll();
    plus.navigator.setStatusBarStyle("dark");
    mui.back = () => {
        if (companyInfo.step !== 1) {
            companyInfo.step = companyInfo.step - 1;
        } else {
            plus.nativeUI.closeWaiting();
            view.close();
        }
    };
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
    step: number;
}

const companyInfo: any = new Vue({
    el: "#companyInfo",
    template,
    data(): IProductDetail {
        return {
            bannerImg: "assets/images/ndt/status_progress.jpg",
            info: null,
            address: {},
            loading: true,
            avatar: "",
            adminDivisionId: userData.adminDivisionId,
            division: "",
            step: 1
        };
    },
    computed: {
        imageUrl() {
            return companyInfo.info.imageUrl ? Neo.REMOTE + "file/download/" + companyInfo.info.imageUrl : "";
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
            companyInfo.getPickerVal();
            console.log(companyInfo.adminDivisionId);
        }
    },
    methods: {
        getUnit: Neo.getUnit,
        showPage(id: string) {
            openPage(id);
        },
        replaceUrl(url) {
            if (url && String(url).indexOf("http") < 0) {
                return Neo.REMOTE + "file/download/" + url;
            } else {
                return url;
            }
        },
        imgChange(newVal, type) {
            companyInfo.info = { ...companyInfo.info, [type]: newVal };
            (this.$refs[type] as any).classList.remove(type);
        },
        nextStep() {
            companyInfo.step += 1;
        },
        reload() {
            getUserInfo();
        },
        avatarChange(newAvatar, type, id) {
            companyInfo.info = { ...companyInfo.info, imageUrl: id };
        },
        getPickerVal() {
            companyInfo.adminDivisionId = picker.villagePicker.getSelectedItems()[0].value
                || picker.townPicker.getSelectedItems()[0].value
                || picker.countyPicker.getSelectedItems()[0].value
                || picker.cityPicker.getSelectedItems()[0].value;
            // 获取当前区域信息
            Neo.getDivision(companyInfo.adminDivisionId, (data) => {
                companyInfo.division = data.fullName;
            });
            // companyInfo.info.address = (picker.cityPicker.getSelectedItems()[0].text || "") +
            //     (picker.countyPicker.getSelectedItems()[0].text || "") +
            //     (picker.townPicker.getSelectedItems()[0].text || "") +
            //     (picker.villagePicker.getSelectedItems()[0].text || "");
        },
        showPicker(pickerName) {
            picker[pickerName].show(picker[pickerName].showCb);
        },
        saveInfo() {
            if (companyInfo.info.name && companyInfo.info.name.length <= 1) {
                return mui.toast("请填写正确的姓名");
            }
            const { city, county, town, village } = companyInfo.address;
            const params = {
                userId: userData.userId,
                adminDivisionId: companyInfo.adminDivisionId,
                imageUrl: companyInfo.info.imageUrl,
                name: companyInfo.info.name,
                code: companyInfo.info.code,
                companyType: companyInfo.info.companyType,
                industryType: companyInfo.info.industryType,
                address: companyInfo.info.address,
                registeredCapital: companyInfo.info.registeredCapital,
                setupTime: companyInfo.info.setupTime,
                legalPerson: companyInfo.info.legalPerson,
                legalPersonIdentityId: companyInfo.info.legalPersonIdentityId,
                contactName: companyInfo.info.contactName,
                contactIdentityId: companyInfo.info.contactIdentityId,
                relatedImgUrls: JSON.stringify([companyInfo.info.positive, companyInfo.info.negative, companyInfo.info.licence])
            };
            plus.nativeUI.showWaiting("企业信息保存中...");
            console.log(JSON.stringify(params));
            Neo.$http("POST", "front/company/update", params).then((res: any) => {
                if (!res.errorCode) {
                    userData.adminDivisionId = companyInfo.adminDivisionId || companyInfo.info.adminDivisionId;
                    Neo.setSettings("user", userData);
                    const user = plus.webview.getWebviewById("user");
                    const news = plus.webview.getWebviewById("news.html");
                    mui.fire(user, "reloadData", {});
                    mui.fire(news, "reloadData", {});
                    mui.later(() => {
                        plus.nativeUI.closeWaiting();
                        // mui.back();
                        plus.webview.currentWebview().close();
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
