/* 监听 DOM 变化，获取预加载的图片 */
import $ from 'jquery';
import 'arrive';
import {
    simulateClick,
    sleep,
} from './content-utils';


// 监听节点变化
function initDomChangeObserver(){
	const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
		console.log("mutationsList======")
		for (let mutation of mutationsList) {
		  if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
			mutation.addedNodes.forEach((node: Node) => {
			  if ((node as Element).matches && (node as Element).matches('div.preRenderContainer')) {
				// 获取当前章节标题
				const chapterTitle = document.querySelector('span.readerTopBar_title_chapter')?.textContent?.replace(/　|\s/g, '') ?? '';
				// 获取已存储的章节图片数据
				let chapterImgData = JSON.parse(localStorage.getItem('chapterImgData') ?? '{}');
	  
				// 获取当前预渲染容器中的所有图片数据
				const imgElements = (node as Element).querySelectorAll('img');
				const imgData: {[key: string]: string} = {};
				imgElements.forEach((img: HTMLImageElement) => {
				  const dataWrCo = img.getAttribute('data-wr-co');
				  const dataSrc = img.getAttribute('data-src');
				  if (dataWrCo && dataSrc) {
					chapterImgData[dataWrCo] = dataSrc;
				  }
				});
	  
				// 将更新后的数据存储到 localStorage 中
				localStorage.setItem('chapterImgData', JSON.stringify(chapterImgData));
			  }
			});
		  }
		}
	  });
	  
	  // 开始监听节点变化
	  observer.observe(document.body, { childList: true, subtree: true });
	  
}

export { initDomChangeObserver };

function initClickNextPageListener(){
	chrome.runtime.onMessage.addListener((msg)=>{
		if(msg == "clickReaderFooterButton"){
			localStorage.setItem('chapterImgData', '{}')
			// 跳转到第一章
			simulateClick($('.readerControls_item.catalog')[0]); // 点击目录显示之后才能够正常获取 BoundingClientRect
			const readerCatalog: HTMLElement | null = document.querySelector('.readerCatalog');
			if (readerCatalog) {
				readerCatalog.removeAttribute('style');
				simulateClick($('.chapterItem_link')[0]);
				readerCatalog.setAttribute('style', 'display: none;');
			}
			
			// 点击下一章直到最后
			setTimeout(clickReaderFooterButton, 1000);
		}else if(msg == "getMarksInCurChap"){
			chrome.runtime.sendMessage({type:"getMarksInCurChap", chapterImgData: JSON.parse(localStorage.getItem('chapterImgData') ?? '{}')})
		}
		
	});
}

function clickReaderFooterButton() {
	const nextPageButton = document.querySelector('.readerFooter_button');
	if (nextPageButton) {
		console.log("前往下一章...")
		var evt = new MouseEvent("click", { bubbles: true, cancelable: true, clientX: 100, clientY: 100 });
		nextPageButton.dispatchEvent(evt);
		setTimeout(clickReaderFooterButton, 1000);
	}else{
		// 通知 background.js 执行 getAllMarks
		chrome.runtime.sendMessage({type:"getAllMarks", chapterImgData: JSON.parse(localStorage.getItem('chapterImgData') ?? '{}')})
	}
}

export { initClickNextPageListener };