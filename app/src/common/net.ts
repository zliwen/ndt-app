// 配置文件
import { mui, noAuth, plus, REMOTE } from "../config";
import { openPage, showMsg } from "./page";
import { getCookie, getSettings, setCookie, setSettings, showError, wainshow } from "./util";

/**
 * @description 拦截请求，过期前两小时如果再请求接口，则刷新token
 * @param  {String} type 请求类型
 * @param  {String} url 请求地址
 * @param  {Object} data 请求数据 默认值为空对象
 * @param  {Function} success 成功回调
 * @param  {Funciton} error? 失败回调
 */

export function ajax(type: string, url: string, data: object | any, success?, error?): void {
    // 如果token过期跳转至登录页面
    const token = getCookie("access_token");
    const isOuter = url.indexOf("http") >= 0;
    // console.log(token);
    if (!isOuter) {
        if (!token && noAuth.indexOf(document.title) < 0) {
            mui.later(() => {
                openPage("login");
            }, 500);
        } else {
            refreshToken();
        }
    }
    let remote = isOuter ? url : REMOTE + url;
    const param: any = {
        dataType: "json", // 服务器返回json格式数据
        type, // HTTP请求类型
        timeout: 10000, // 超时时间设置为10秒
        headers: {
            "Authorization": token ? token : "1",
            "Content-Type": "application/json; charset=UTF-8"
        },
        success: (rsp) => {
            success && success(rsp);
        },
        error: (xhr, type, errorThrown) => {
            error && error(xhr, type, errorThrown);
            if (!wainshow()) {
                showMsg("获取数据失败，请重试");
            }
        }
    };
    if (type.toLowerCase() === "get") {
        remote += "?";
        // tslint:disable-next-line:forin
        for (const i in data) {
            remote += (i + "=" + data[i] + "&");
        }
    } else {
        param.data = data;
    }
    mui.ajax(remote, param);
}

export function $http(type: string, url: string, data: object = {}, success?, error?) {
    const ajaxPromise = new Promise((resolve, reject) => {
        ajax(type, url, data, (rsp) => {
            success && success(rsp);
            resolve(rsp);
        }, (xhr, type, errorThrown) => {
            error && error(xhr, type, errorThrown);
            reject([xhr, type, errorThrown]);
        });
    });
    return ajaxPromise;
}

/**
 * @description 刷新token 在过期前一小时刷新Token
 * @param cb 刷新后回调
 */
export function refreshToken(cb?: (data?: object) => void): void {
    const expiresTime = getSettings("expires");
    if (expiresTime && (expiresTime - Date.now()) / 1000 < 3600 && document.title !== "login") {
        const userInfo = getSettings("user");
        const token = getCookie("access_token");
        mui.ajax(REMOTE + "refreshToken?refreshToken=" + userInfo.refreshToken, {
            dataType: "json", // 服务器返回json格式数据
            type: "get", // HTTP请求类型
            headers: { Authorization: token ? token : "1" },
            success: (rsp: any) => {
                if (!rsp.errorCode) {
                    setSettings("expires", new Date().getTime() + rsp.data.tokenExpireMinutes * 60 * 1000);
                    setCookie("access_token", rsp.data.token, rsp.data.tokenExpireMinutes * 60);
                    setSettings("user", rsp.data);
                    cb ? cb(rsp) : "";
                } else {
                    setCookie("access_token", " ", 0.001);
                    setSettings("expires", "");
                    showError(rsp.errorCode, "刷新Token失败");
                }
            },
            error: (xhr, type, errorThrown) => {
                showMsg("刷新Token错误，请重试");
            }
        });
    } else {
        cb ? cb() : "";
    }
}

// 获取codeTable
export function getCodeTable(id?, cb?, error?) {
    const codeTable = getSettings("codeTable");
    const codeList = codeTable && codeTable["code" + id];
    if (codeTable) {
        codeList && cb && cb(codeList);
        if (!codeList && id !== undefined) {
            mui.toast("未获取到code：" + id + "的码值");
            error && error();
        }
    } else {
        const obj = {};
        const list: number[] | any = (Array as any).from((Array as any)(100).keys());
        $http("POST", "dict/list/1/300", { list }).then((res: any) => {
            if (!res.errorCode && res.data.pageData && res.data.pageData.length) {
                res.data.pageData.forEach((item) => {
                    if (!obj["code" + item.typeId]) {
                        obj["code" + item.typeId] = [];
                    }
                    obj["code" + item.typeId].push(item);
                });
                setSettings("codeTable", obj);
                if (obj["code" + id]) {
                    cb && cb(obj["code" + id]);
                } else {
                    id !== undefined && mui.toast("未获取到code：" + id + "的码值");
                }
            } else {
                mui.toast("未获取到code：" + id + "的码值");
                error && error();
            }
        }).catch(() => {
            error && error();
        });
    }
}

// 计算金额
export function getUnit(code, unit) {
    let val: string = "";
    getCodeTable(code, (codeList) => {
        const unitStr = codeList.find((item) => {
            return item.id === (unit || 1);
        });
        val = unitStr && unitStr.value;
    });
    return val || "";
}

// 获取区域地址

export function getDivision(id, success) {
    $http("GET", "division/detail/" + id).then((res: any) => {
        if (!res.errorCode) {
            success && success(res.data);
        }
    });
}