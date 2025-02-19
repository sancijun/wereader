import $ from "jquery";
import { DefaultRegexPattern } from "../background/modules/bg-vars";
import { BACKUPKEY, RegexpInputClassName, STORAGE_ERRORMSG } from "./options-var";
//错误捕捉函数
function catchErr(sender: string) {
	if (chrome.runtime.lastError) {
        console.log(`${sender} => chrome.runtime.lastError`, chrome.runtime.lastError.message);
        return true;
	}else{
        return false;
    }
}

//更新 sync 和 local
// TODO:parma type
function updateStorageArea(
	configMsg: {setting?: {
		[key: string]: any;
	}, key?: number|string|symbol, value?: unknown,settings?: {[key: string]: any}},
	callback=function(){}){
    //存在异步问题，故设置用于处理短时间内需要进行多次设置的情况
    if(configMsg.setting && configMsg.settings){
        chrome.storage.sync.set(configMsg.setting, function(){
            catchErr("updateSyncAndLocal")
            chrome.storage.local.set(configMsg.settings!,function(){
                if(catchErr("updateSyncAndLocal"))console.warn(STORAGE_ERRORMSG)
                callback()
            })  
        })
    }else if(configMsg.key != undefined){//不排除特殊键值，所以判断是否为 undefined
        let config: {[key: number|string|symbol]: any} = {}
        let key = configMsg.key
        let value = configMsg.value
        config[key] = value
        chrome.storage.sync.set(config,function(){
            if(catchErr("updateSyncAndLocal"))console.warn(STORAGE_ERRORMSG)
            chrome.storage.local.get(function(settings){
                const currentProfile = $("#profileNamesInput").val() as string;
                settings[BACKUPKEY][currentProfile][key] = value
                chrome.storage.local.set(settings,function(){
                    if(catchErr("updateSyncAndLocal"))console.warn(STORAGE_ERRORMSG)
                    callback()
                })
            })
        })
    }
}

//从页面获取正则设置
type reName = 're1' | 're2' | 're3' | 're4' | 're5';
type reConfigType = {replacePattern:string, checked:boolean};
type reConfigCollectionType = {[key in reName]: reConfigType};
type reConfigKeyType = {re: reConfigCollectionType}
function getRegexpSet(){
    const regexpKey = "re"
    let config: reConfigKeyType = {re: {re1:DefaultRegexPattern,re2:DefaultRegexPattern,re3:DefaultRegexPattern,re4:DefaultRegexPattern,re5:DefaultRegexPattern}}
    let checkBoxCollection = document.getElementsByClassName("contextMenuEnabledInput");
    for(let i = 0;i < checkBoxCollection.length;i++){
		let checkBox = checkBoxCollection[i] as HTMLInputElement;
        let regexInputContainer = checkBox.parentNode!.parentNode! as HTMLElement;
        let checkBoxId = checkBox.id as reName;
		let regexpInput = regexInputContainer.getElementsByClassName(RegexpInputClassName)[0] as HTMLInputElement;
        let regexpInputValue = regexpInput.value
        //需要检查匹配模式是否为空
        let isChecked = regexpInputValue != ''?checkBox.checked:false
        config[regexpKey][checkBoxId] = {replacePattern: regexpInputValue, checked: isChecked}
    }
    return {key: regexpKey, value: config[regexpKey]}
}

export {catchErr, updateStorageArea, getRegexpSet, reConfigCollectionType};