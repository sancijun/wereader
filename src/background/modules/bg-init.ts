import { catchErr } from "./bg-utils";
import { BackupKey, Config, ConfigType, DefaultBackupName, StorageErrorMsg } from "./bg-vars";

// 初始化设置
function settingInitialize() {
	//获取 syncSetting
	chrome.storage.sync.get(function (configInSync) {
		let unusedKeysInSync: string[] = []
		type keyType = keyof ConfigType;
		for(let key in configInSync){
			if(Config[key as keyType] !== undefined) continue;
			//如果 syncSetting 中的某个键在 Config 中不存在，则删除该键
			delete configInSync[key];
			unusedKeysInSync.push(key);
		}
		for(let key in Config){
			//如果 Config 中的某个键在 syncSetting 中不存在（或者类型不同），则使用 Config 初始化 syncSetting
			if(configInSync[key] === undefined
				|| configInSync[key].constructor != Config[key as keyType].constructor){
				configInSync[key] = Config[key as keyType];
			}else{//如果 Config 中的某个键在 syncSetting 中存在（并且类型相同），则使用 syncSetting 初始化 Config
				Config[key as keyType] = configInSync[key] as never;
			}
		}
		//将 syncSetting 存储到 sync
		chrome.storage.sync.set(configInSync,function(){
			if(catchErr("settingInitialize"))console.error(StorageErrorMsg);
			//必须用 remove 来删除元素
			chrome.storage.sync.remove(unusedKeysInSync,function(){
				if(catchErr("settingInitialize"))console.error(StorageErrorMsg);
			});
		})
		//获取 localSetting
		chrome.storage.local.get([BackupKey], function(result) {
			let configsInLocal = result[BackupKey];
			let configNameInSyncStorage = configInSync.backupName;
			delete configInSync.backupName
			if(configsInLocal === undefined){//如果本地无设置
				configsInLocal = {};
				configsInLocal[DefaultBackupName] = configInSync;
			}
			if(configsInLocal[DefaultBackupName] === undefined){//如果本地无默认设置
				configsInLocal[DefaultBackupName] = configInSync;
			}
			//将 syncSetting 更新至 localSetting
			configsInLocal[configNameInSyncStorage] = configInSync;
			//遍历 localSetting 检查格式
			let formatOfConfigInLocal: {[key: string]: any} = Config;
			delete formatOfConfigInLocal.backupName;
			for(let configName in configsInLocal){
				let localConfig = configsInLocal[configName];
				for(let keyOfLocalConfig in localConfig){//遍历单个配置
					//如果配置中的某个键在 formatOfConfigInLocal 中不存在，则删除该键
					if(formatOfConfigInLocal[keyOfLocalConfig] === undefined){
						delete configsInLocal[configName][keyOfLocalConfig];
					}
					//如果 formatOfConfigInLocal 中的某个键在配置中不存在（或者类型不同），则使用 formatOfConfigInLocal 初始化配置
					for(let keyOfFormat in formatOfConfigInLocal){
						if(localConfig[keyOfFormat]===undefined||formatOfConfigInLocal[keyOfFormat].constructor!=localConfig[keyOfFormat].constructor){
							configsInLocal[configName][keyOfFormat] = formatOfConfigInLocal[keyOfFormat];
						}
					}
				}
			}
			result[BackupKey] = configsInLocal;
			chrome.storage.local.set(result,function(){
				if(catchErr("settingInitialize"))console.error(StorageErrorMsg);
			});
		})
	})
}

export {settingInitialize};