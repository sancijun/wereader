/* 监听 DOM 变化，获取预加载的图片 */


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
					imgData[dataWrCo] = dataSrc;
				  }
				});
	  
				// 将当前章节的图片数据添加到已存储的数据中
				chapterImgData[chapterTitle] = imgData;
	  
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
			clickReaderFooterButton();
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