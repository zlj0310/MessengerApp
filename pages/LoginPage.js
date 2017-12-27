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
    Image,
    Dimensions,
    Alert,
    Button
} from 'react-native';
import axios from '../utils/axios';
const basicConfig = require('../utils/config');

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            code: '',
            codeSrc: basicConfig.baseURL + '/getCaptcha?r=' + Math.random()
        };
    }
    static navigationOptions = {
        headerTitle:'Login'
    };

    componentDidMount() {
        axios({
            method:'head',
            url:'/getCaptcha?r=' + Math.random(),
        })
    }

    refreshCode() {
        this.setState({
            codeSrc: basicConfig.baseURL + '/getCaptcha?r='+ Math.random()
        })
    }

    doLogin() {
        if(!this.state.username){
            Alert.alert('请输入用户名');
            return;
        }
        if(!this.state.password){
            Alert.alert('请输入密码');
            return;
        }
        if(!this.state.code){
            Alert.alert('请输入验证码');
            return;
        }
        let params = {
            username: this.state.username,
            password: 'YTEyMzQ1Ng==',
            sRand: this.state.code,
            remember: false
        };

        axios.post('/login', params)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    Alert.alert('登录成功！');
                }
            })
            .catch((error) => {

            });
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.mainWrapper}>
                <View style={styles.formItem}>
                    <Text style={styles.formTxt}>用户名：</Text>
                    <TextInput
                        style={styles.formInput}
                        onChangeText={(username) => this.setState({username})}
                        placeholder='username'/>
                </View>
                <View style={styles.formItem}>
                    <Text style={styles.formTxt}>密码：</Text>
                    <TextInput
                        style={styles.formInput}
                        secureTextEntry={true}
                        onChangeText={(password) => this.setState({password})}
                        placeholder='password'/>
                </View>
                <View style={styles.formItem}>
                    <Text style={styles.formTxt}>验证码：</Text>
                    <View style={styles.formInputWrapper}>
                        <TextInput
                            style={[styles.formInput, styles.formCode]}
                            onChangeText={(code) => this.setState({code})}
                            placeholder='code'/>
                        <TouchableOpacity onPress={this.refreshCode.bind(this)}>
                            <Image source={{uri:this.state.codeSrc}} style={styles.image} resizeMode='stretch'></Image>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity onPress={this.doLogin.bind(this)}>
                    <View style={styles.formItem} >
                        <Text style={styles.submitBtn}>提交</Text>
                    </View>
                </TouchableOpacity>

                <Button title="Go to chat" onPress={() => navigate('ChatList')}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        flexDirection:'column'
    },
    formItem: {
        padding: 10
    },
    formInputWrapper: {
        flexDirection:'row'
    },
    formCode: {
        width: 0.6 * Dimensions.get('window').width,
    },
    formTxt: {
        height: 20,
        paddingBottom: 10,
        color: '#333'
    },
    formInput: {
        height: 40,
        backgroundColor: '#fff',
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        color: '#aaa',
        padding: 5,
    },
    submitBtn: {
        height: 40,
        backgroundColor: '#46AA56',
        color: '#fff',
        lineHeight: 40,
        textAlign: 'center',
        borderRadius: 15
    },
    image: {
        width: 100,
        height: 40,
        marginLeft: 0.05 * Dimensions.get('window').width,
    }
});

export default LoginPage;


