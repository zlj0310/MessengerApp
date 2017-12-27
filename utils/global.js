//获取服务端的token
export const getStorageToken = (str) => {
    let headerStorage = str.split(';');
    let token;
    for(let i=0;i<headerStorage.length;i++){
        if(headerStorage[i].indexOf('token')>-1){
            token = headerStorage[i].split('=')[1]
        }
    }
    return token
};

export const formatDate = (dateTime) => {
    let date = new Date(dateTime);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    let D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    let s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
    return Y + M + D + h + m + s;
};

export const formatDate2 = (dateTime) => {
    let date = new Date(dateTime);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    let D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    let s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
    let date2 = new Date();
    let Y2 = date2.getFullYear() + '-';
    let M2 = (date2.getMonth()+1 < 10 ? '0'+(date2.getMonth()+1) : date2.getMonth()+1) + '-';
    let D2 = (date2.getDate() < 10 ? '0' + (date2.getDate()) : date2.getDate()) + ' ';
    if(Y == Y2 && M == M2 && D == D2){
        return h + m + s;
    }else {
        return Y + M + D + h + m + s;
    }
    return Y + M + D + h + m + s;
};

export const showChatTime = (dateTime1,dateTime2) => {
    let date1 = new Date(dateTime1);  //开始时间
    let date2 = new Date(dateTime2);    //结束时间
    let date3 = date2.getTime()-date1.getTime(); //时间差的毫秒数
    //计算出相差天数
    let days = Math.floor(date3/(24*3600*1000));
    //计算出小时数

    let leave1 = date3%(24*3600*1000);    //计算天数后剩余的毫秒数
    let hours = Math.floor(leave1/(3600*1000));
    //计算相差分钟数
    let leave2 = leave1%(3600*1000);       //计算小时数后剩余的毫秒数
    let minutes = Math.floor(leave2/(60*1000));
    //计算相差秒数
    let leave3 = leave2%(60*1000);     //计算分钟数后剩余的毫秒数
    let seconds = Math.round(leave3/1000);

    if(days == 0 && hours == 0 && minutes <= 30){   //两次聊天内容时间间隔在30分钟内，不需要显示时间
        return false
    }else {
        return true
    }
};

