import axios from 'axios';
import qs from 'qs';
import { basicConfig } from './config.js'
import {Alert} from 'react-native';
import {getStorageToken} from './global'

// Add a request interceptor
axios.interceptors.request.use(function (config) {
    config.url = basicConfig.baseURL + config.url;
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    const method = config.method;
    switch (method) {
        case 'get':
            const params = config.params || {};
            params['token'] = basicConfig.token;
            break;
        case 'post':
            const data = config.data || {};
            data['token'] = basicConfig.token;
            if (config.headers['Content-Type'] != 'multipart/form-data') {
                config.transformRequest = [function(data) {
                data = qs.stringify(data);
                    return data;
                }];
            }
            break;
    }
    // console.log('---config----',config)
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    //首次获取匿名token或者是用户手动清除缓存后需要再次去获取tokenBefore
    let headersBefore = JSON.stringify(response.headers);
    if(headersBefore.indexOf('set-storage')>-1){
        let headers = JSON.parse(headersBefore.replace(/set-storage/, "storage"));
        // 读取tokenBefore
        // console.log('---getStorageToken(headers.storage)---',getStorageToken(headers.storage))
        // storage.load({
        //     key: 'tokenBefore',
        //     id: '1001'
        // })
        //     .catch(err => {
        //         if(headers.storage){
        //             storage.save({
        //                 key: 'tokenBefore',  // 注意:请不要在key中使用_下划线符号!
        //                 id: '1001',   // 注意:请不要在id中使用_下划线符号!
        //                 data: getStorageToken(headers.storage),
        //                 expires: 1000 * 60
        //             });
        //         }
        //     });
    }

    if (response.data && !response.data.success) {
        Alert.alert(response.data.message);
    }
    // console.log('---response----',response)
    return response;
}, function (error) {
    // Do something with response error
    return Promise.reject(error);
});

export default axios