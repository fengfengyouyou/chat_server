function commonFailReq(msg){
    console.log(msg)
}
 /**
     * 读取图片到数组
     * @param files
**/
function readerFileToList(files){
    return new Promise(function(resolve, reject){
        if (typeof FileReader === 'function') {
            let uploadList = []
            let fileLength = 0;
            const reader = new FileReader();
            reader.readAsDataURL(files[fileLength]);
            reader.onload = function(e) {
                if(e.target.result) {
                    uploadList.push(e.target.result)
                    fileLength++;
                    if(fileLength < files.length) {
                        reader.readAsDataURL(files[fileLength]);
                    } else {
                        resolve(uploadList)
                    }
                }
            }
        }else{
            let error = 'FileReader API不支持'
            reject(error)
        }
    })
}

// 检查文件格式
function checkIsImage(files){
    return new Promise(function(resolve, reject){
        let fileLength = 0;
        let checkImage = function(file){
            if (!file.type.includes('image/')) {
                let error = '请选择图片'
                reject(error)
            }
            fileLength++
            if(fileLength<files.length){
                checkImage(files[fileLength])
            }else{
                resolve(files)
            }
        }
        checkImage(files[fileLength])
    })
    
}