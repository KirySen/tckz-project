import Taro, {useDidShow, getStorageSync} from '@tarojs/taro'
import { View, Form, Button, Input } from "@tarojs/components";
import './index.less'

const AddUser = () => {
    useDidShow(() => {
        if (!getStorageSync('login')) {
            Taro.showToast({
                title: '未登录1秒后跳转至登录界面',
                duration: 1000,
            })
            setTimeout(() => {
            Taro.redirectTo({
                url: '/pages/index/index',
            })
            }, 1100)
          
        }
    })
    // 数据库
    const db = Taro.cloud.database()

    // 账户集合
    const users = db.collection('users')

    const formSubmit = (e) => {
        if (!e.detail.value.user || !e.detail.value.password) {
            return Taro.showToast({
                title: '请填写正确的信息',
                icon: 'none',
                duration: 1000
            })
        }
        // 检测是否账户重复
        users.where({
            user: e.detail.value.user
        })
            .get({})
            .then(async res => {
                console.log(res)
                Taro.showLoading({
                    title: '提交中...',
                })
                await Taro.hideLoading()
                if (res.data.length > 0) {
                    Taro.showToast({
                        title: '账户已存在',
                        icon: 'none',
                        duration: 1000
                    })

                } else {
                    users.add({
                        data: {
                            user: e.detail.value.user,
                            password: e.detail.value.password,
                            role: 0
                        }
                    }).then(addStatus => {
                        console.log('添加成功', addStatus)
                        Taro.showToast({
                            title: '添加成功',
                            icon: 'success',
                            duration: 1000
                        })
                        setTimeout(() => {
                                Taro.redirectTo({
                                url: '/pages/default/index'
                            })
                        }, 1000)
                    }).catch(err => {
                        console.log(err)
                    })
                }
            })
            .catch(err => console.log(err))

    }
    return (
        <View className='container'>
            <View className='title'>添加账号</View>
            <Form onSubmit={formSubmit} >
                <View className='vertical flex-between example-body'>
                    <Input className='input-container' name='user' type='text' placeholder='请输入账号' focus maxlength={11} />
                    <Input className='input-container' name='password' type='password' placeholder='请输入密码' maxlength={6} />
                    <View className='b-box dis-flex flex-between'>
                        <Button type='primary' formType='submit'>提交</Button>
                    </View>
                </View>
            </Form>
        </View>
    )
}

export default AddUser