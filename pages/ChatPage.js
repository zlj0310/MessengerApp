/**
 * Created by zhulijun on 2017/12/7.
 */

import React,{ Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Animated,
    Alert,
    Image,
    Dimensions,
} from 'react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
import { formatDate2, showChatTime } from '../utils/global'
import axios from '../utils/axios';

const io = require('../utils/socket.io');
const socket = io.connect('ws://47.90.48.72:1337');    //TODO 换成 ws://47.90.48.72:1337  ws://localhost:1337
const basicConfig = require('../utils/config.js');

// 连接上
socket.on('connect', function () {
    console.log('----connect');
    // 请求加入
    if(basicConfig.pageId){
        console.log('emit new user');
        socket.emit('new user', basicConfig.pageId);
    }
});

class ChatPage extends Component {
    constructor(props) {
        super(props);
        const {params} = this.props.navigation.state;
        this.state = {
            text: '',
            itemDetail: params.data.item,
            flatList: [],
            transArr: [],
            noMoreHistory: false,
            newFlatList: [],
            pageImg: 'https://graph.facebook.com/v2.8/141459823140062/picture',
        };

        const _this = this;

        // 接收私聊信息
        socket.on('receive private message', function (data) {
            console.log('---receive private message-chatPage--',data)
            if(parseInt(data.addresser) == _this.state.itemDetail.psId){
                let content;
                if(data.body.message.text) {
                    content = {
                        location: '',
                        text: data.body.message.text,
                        url:''
                    };
                }else if(data.body.message.attachment){
                    content = {
                        location: '',
                        text: '',
                        url: data.body.message.attachment.payload.url
                    };
                }
                let newHistory = {
                    content: JSON.stringify(content),
                    recipientId: data.addresser,
                    sender: false,
                    senderId: data.recipient,
                    timestamp: data.time,
                    type: data.body.message.text ? 1: 2,
                };
                _this.state.newFlatList = _this.state.flatList;
                _this.state.newFlatList.push(newHistory);
                _this.setState({
                    flatList: _this.state.newFlatList
                });
                console.log('--flatList--',_this.state.flatList)
            }
        });
    }

    componentDidMount() {
        //获取历史消息
        this.getHistoryList();
        //更新读取状态
        if(this.state.itemDetail.readFlag == 0){
            this.updateReadFlag();
        }
        this.getChatList()
    }
    getHistoryList(){
        let params = {
            senderId: basicConfig.pageId,
            recipientId: this.state.itemDetail.psId,
            endTime: new Date().getTime(),
            startTime: -1,
            num: 20
        };
        axios.get('/count/searchHistoryMessage',{
            params: params || {}
        })
            .then((res) => {
                if (res.data.success && res.data.data.length > 0) {
                    let data = res.data.data.reverse();
                    data[0].showTime = true;
                    for(let i=0;i<data.length;i++){
                        if(data[i].senderId == basicConfig.pageId){
                            data[i].sender = true;
                        }else {
                            data[i].sender = false;
                        }
                        if(i < data.length-1 && showChatTime(data[i].timestamp , data[i+1].timestamp)){
                            data[i+1].showTime = true;
                        }
                    }
                    this.setState({
                        flatList: data
                    });
                }
            })
            .catch((error) => {
                console.log('--error--',error)
            });
    }

    updateReadFlag() {
        axios.get('/fb/message/updateReadFlag',{
            params: {bindId: this.state.itemDetail.id} || {}
        })
        .catch((error) => {
            console.log('--error--',error)
        });
    }

    sendMessage() {
        if(!this.state.text){
            Alert.alert('发送内容不能为空');
            return false;
        }

        let req = {
            "addresser": basicConfig.pageId,
            "recipient": this.state.itemDetail.psId,
            "time": new Date().getTime(),
            "body": {
                "messaging_type": "RESPONSE", //<MESSAGING_TYPE>  RESPONSE  UPDATE
                "recipient": {
                    "id": this.state.itemDetail.psId
                },
                "message": {
                    "text": this.state.text
                }
            }
        };
        socket.emit('send private message', req);
        let content = {
            location: '',
            text: this.state.text,
            url:''
        };
        let newHistory = {
            content: JSON.stringify(content),
            recipientId: this.state.itemDetail.psId,
            sender: true,
            senderId: basicConfig.pageId,
            timestamp: new Date().getTime(),
            type: 1,
        };

        this.state.newFlatList = this.state.flatList;
        this.state.newFlatList.push(newHistory);
        this.setState({
            flatList: this.state.newFlatList
        });

        this.setState({
            text: ''
        });
    }

    render() {
        return (
            <View style={styles.mainWrapper}>
                {this.state.noMoreHistory ?
                    <View style={styles.errorWrapper}>
                        <Text>无更多历史消息</Text>
                    </View> : <View></View>
                }

                <View style={styles.mainContent}>
                    <AnimatedFlatList
                        style={styles.flatListWrapper}
                        ref={(flatList) => this._flatList = flatList}
                        renderItem={this._renderItem}
                        numColumns ={1}
                        // refreshing={this.state.refreshing}
                        // onEndReachedThreshold={0.2}
                        removeClippedSubviews={false}
                        data={this.state.flatList}>
                        getItemLayout={(data,index)=>(
                            {length: 100, offset: (100+2) * index, index}
                        )}
                        keyExtractor={this._keyExtractor}
                    </AnimatedFlatList>
                </View>
                <View style={styles.operateWrapper}>
                    <TextInput
                        style={styles.searchInput}
                        blurOnSubmit={true}
                        onSubmitEditing={this.sendMessage.bind(this)}
                        onChangeText={(text) => this.setState({text})}
                        value={this.state.text}
                        placeholder='请输入内容'
                    />

                    <TouchableOpacity onPress={this.sendMessage.bind(this)}>
                        <Text style={styles.sendTxt}>发送</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    _keyExtractor = (item, index) => index;

    _renderItem = (result) => {
        return (
            <View>
                {result.item.showTime ?
                    <Text style={styles.itemTime}>{formatDate2(result.item.timestamp)}</Text> : <Text></Text>
                }
                {result.item.sender ?
                    <View style={[styles.itemWrapper, styles.extraItemWrapper]}>
                        <View style={styles.textWrapper}>
                            <Text style={ styles.itemRightText}>{JSON.parse(result.item.content).text}</Text>
                        </View>
                        <Image source={{uri:this.state.pageImg}} style={[styles.imageRight,styles.image]} resizeMode='stretch'></Image>
                    </View> :
                    <View style={styles.itemWrapper}>
                        <Image source={{uri:this.state.itemDetail.psAvatar}} style={[styles.imageLeft,styles.image]} resizeMode='stretch'></Image>
                        <View style={styles.textWrapper}>
                            {result.item.type == 1 ?
                                <Text style={styles.itemLeftText}>{JSON.parse(result.item.content).text}</Text> : <View></View>
                            }
                            {result.item.type == 2 ?
                                <View style={styles.receiveImageWrapper}>
                                    <Image source={{uri:JSON.parse(result.item.content).url}} style={styles.receiveImage} resizeMode='stretch'></Image>
                                </View> : <View></View>
                            }
                        </View>
                    </View>
                }
            </View>
        )
    };
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        flexDirection:'column',
    },
    mainContent: {
        flex: 1,
    },
    flatListWrapper: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
    },
    operateWrapper: {
        flexDirection:'row',
        height: 50,
        borderTopWidth: 1,
        borderTopColor: '#aaa',
        marginTop: 20
    },
    searchInput: {
        flex: 1,
        height: 30,
        backgroundColor: '#fff',
        margin: 10,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 5
    },
    sendTxt: {
        lineHeight: 30,
        width:50,
        height: 30,
        backgroundColor: '#aaa',
        color: '#fff',
        margin: 10,
        textAlign: 'center',
    },
    itemWrapper:{
        flexDirection:'row',
    },
    extraItemWrapper: {
        justifyContent: 'flex-end'
    },
    itemTime: {
        textAlign:'center',
        marginTop: 15,
        marginBottom: 10,
        fontSize: 12,
        color: '#aaa'
    },
    imageRight: {
        marginLeft: 7,
    },
    imageLeft: {
        marginRight: 7,
    },
    image: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginTop: 1
    },
    textWrapper: {
        marginBottom: 8,
        maxWidth: 0.7 * Dimensions.get('window').width
    },
    itemRightText: {
        textAlign:'right',
        backgroundColor: '#8CE529',
        padding: 8,
    },
    itemLeftText: {
        textAlign:'left',
        backgroundColor: '#fff',
        padding: 8
    },
    receiveImageWrapper: {
        width: 0.5 * Dimensions.get('window').width,
        height: 0.5 * Dimensions.get('window').width,
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 3
    },
    receiveImage: {
        width: 0.5 * Dimensions.get('window').width - 10,
        height: 0.5 * Dimensions.get('window').width - 10,
    }
});

export default ChatPage;