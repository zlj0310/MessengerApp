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
    Image,
    Button
} from 'react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
import { formatDate2 } from '../utils/global'
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

class ChatList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
            flatList: [],
            refreshing: false,
            error: false,
            searchEmpty: false,
            searchStatus: false,
        };
        const _this = this;

        // 接收私聊信息
        socket.on('receive private message', function (data) {
            console.log('-_this--',_this)
            console.log('---receive private message ChatList---',data)
            axios.get('/fb/message/getFbMsgUserList',{
                params: {psNickName: ''}
            })
                .then((res) => {
                    console.log('-res--',res)
                    if (res.data.success && res.data.data) {
                        _this.setState({
                            flatList: res.data.data
                        });
                    }else {
                        _this.setState({
                            searchEmpty: true
                        });
                    }
                })
                .catch((error) => {
                    _this.setState({
                        error: true
                    });
                    console.log('---error---',error)
                });
        });
    }
    static navigationOptions = {
        headerTitle:'ChatList'
    };

    componentDidMount() {
        this.getContactList();
    }
    componentWillUnmount(){
        console.log('----componentWillUnmount--chatList-----')
    }
    getContactList(type) {
        //1-取消 2-搜索
        if(type == 1){
            this.state.searchStatus = false;
            this.state.searchEmpty = false;
            this.state.searchText = '';
        }
        if(type == 2){
            this.setState({
                searchStatus: true
            });
        }
        axios.get('/fb/message/getFbMsgUserList',{
            params: {psNickName: this.state.searchText}
        })
            .then((res) => {
                if (res.data.success && res.data.data) {
                    this.setState({
                        flatList: res.data.data
                    });
                }else {
                    this.setState({
                        searchEmpty: true
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    error: true
                });
                console.log('---error---',error)
            });
    }

    render() {
        return (
            <View style={styles.mainWrapper}>
                <View style={styles.searchWrapper} >
                    <TextInput
                        style={styles.searchInput}
                        blurOnSubmit={true}
                        onSubmitEditing={() => this.getContactList(2)}
                        onChangeText={(searchText) => this.setState({searchText})}
                        value={this.state.searchText}
                        placeholder='请输入搜索内容'/>
                    {this.state.searchStatus ?
                        <TouchableOpacity onPress={() => this.getContactList(1)}>
                            <Text style={styles.cancelTxt}>取消</Text>
                        </TouchableOpacity>
                        : <View></View>
                    }
                </View>
                {this.renderContent()}
            </View>
        );
    }

    renderContent() {
        if(this.state.error) {
            return (
                <View style={styles.errorWrapper}>
                    <TouchableOpacity onPress={() => this.getContactList()}>
                        <Text style={styles.errorText}>network error,please try again</Text>
                    </TouchableOpacity>
                </View>
            );
        }else if(this.state.searchEmpty){
            return (
                <View style={styles.errorWrapper}>
                    <Text style={styles.errorText}>无搜索联系人</Text>
                </View>
            );
        }else {
            return (
                <AnimatedFlatList
                    style={styles.flatListWrapper}
                    // ref={(flatList)=>this.state.flatList = flatList}
                    ItemSeparatorComponent={this._separator}
                    renderItem={this._renderItem}
                    numColumns={1}
                    refreshing={this.state.refreshing}
                    // onRefresh={this._onRefresh}
                    onEndReachedThreshold={0.2}
                    removeClippedSubviews={false}
                    data={this.state.flatList}>
                    keyExtractor={this._keyExtractor}
                </AnimatedFlatList>
            );
        }
    }

    _keyExtractor = (item, index) => index;

    _renderItem = (result) => {
        return (
            <TouchableOpacity onPress={() => this.chatDetail(result)}>
                <View style={styles.itemWrapper}>
                    <View style={styles.avatarImg}>
                        <Image source={{uri:result.item.psAvatar}} style={styles.image} resizeMode='stretch'></Image>
                        <View style={result.item.readFlag == 0 ? styles.unreadNews : ''}></View>
                    </View>
                    <View style={styles.itemRight}>
                        <View style={styles.rightTop}>
                            <Text>{result.item.psNickName}</Text>
                            <Text>{formatDate2(result.item.lastMsgTime)}</Text>
                        </View>
                        <View style={styles.rightBottom}>
                            {this._renderType(JSON.parse(result.item.psExtendInfo))}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    };

    _renderType= (info) => {
        if(info.type == '1') {
            return (
                <Text numberOfLines={1} style={styles.typeTxt}>{info.text}</Text>
            )
        }else if(info.type == '2'){
            return (
                <Text numberOfLines={1} style={styles.typeTxt}>[图片]</Text>
            )
        }
    };


    _separator = () => {
        return <View style={{height:1,backgroundColor:'#eee'}}/>;
    };

    chatDetail(result){
        const { navigate } = this.props.navigation;
        if(navigate) {
            navigate('ChatPage', { data: result });
        }
    };
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        flexDirection:'column'
    },
    searchWrapper: {
        flexDirection:'row'
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: '#fff',
        borderWidth: 1,
        backgroundColor: '#fff',
        margin: 10,
        fontSize: 14,
        paddingLeft: 10,
        paddingRight: 10
    },
    flatListWrapper: {
        backgroundColor: '#fff',
    },
    itemWrapper: {
        flexDirection:'row',
        padding: 10,
    },
    image: {
        width: 50,
        height: 50
    },
    avatarImg: {
        marginRight: 10
    },
    itemRight: {
        flex: 1,
        backgroundColor: '#fff',
        flexDirection:'column',
        marginTop: 5
    },
    rightTop: {
        flex: 1,
        flexDirection:'row',
        justifyContent: 'space-between'
    },
    rightBottom: {
        flex: 1,
    },
    errorWrapper: {
        marginLeft: 50,
        marginRight: 50
    },
    errorText: {
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
        padding: 10
    },
    cancelTxt: {
        marginLeft: 5,
        marginRight: 10,
        lineHeight: 55,
        color: '#8CE529',
    },
    typeTxt: {
        color: '#aaa',
        fontSize: 14
    },
    unreadNews: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ff0000',
        position: 'absolute',
        top: -5,
        right: -5
    }
});

export default ChatList;


