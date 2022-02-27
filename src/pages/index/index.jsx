import Taro, { setStorage, useDidShow, getStorageSync } from '@tarojs/taro'
import { View, Form, Input, Button } from '@tarojs/components'
import './index.less'

const Index = () => {

  useDidShow(() => {
    if (getStorageSync('login')) {
      Taro.redirectTo({
        url: '/pages/default/index',
      })
    } else {
      console.log('未登录状态')
    }
    Taro.showShareMenu({
      withShareTicket: true
    })
  })
  Taro.onShareAppMessage= () => {

  }
  const formSubmit = (e) => {
    const db = Taro.cloud.database()

    // 账户集合
    const accountList = db.collection('users')

    console.log(e.detail.value.user, '发送')

    //校验账号
    if (!e.detail.value.user) {
      Taro.showToast({
        title: '请输入账号',
        icon: "none"
      })
      return
    }
    accountList.get({})
    .then(res => {
      console.log('获取账户数据库资料:  ', res)
    })
    console.log()
    // 验证密码
    accountList
      .where({
        user: e.detail.value.user
      })
      .get({
      })
      .then(res => {
        console.log("获取账号成功", res);
        //校验密码长度
        if (e.detail.value.password.length < 4) {
          Taro.showToast({
            title: '密码至少4位',
            icon: "none"
          })
          return
        }
        //校验密码是否等于数据库中的密码
        if (e.detail.value.password === res.data[0].password) {
          console.log("登录成功", res);
          //显示登录成功提示
          Taro.showToast({
            title: '登录成功',
            icon: "success",
            duration: 1000,
            //提示2秒后自动跳转到首页
            success: function () {
              setStorage({
                key: "login",
                data: true
              })
              setStorage({
                key: 'role',
                data: res.data[0].role
              })
              setTimeout(function () {
                Taro.navigateTo({
                  url: '/pages/default/index',
                })
              }, 1000)
            }
          })
        } else {
          console.log("密码不正确，登录失败");
          Taro.showToast({
            title: '密码不正确',
            icon: "none"
          })
        }
      })
      .catch(err => {
        console.log("获取账号失败", err);
        Taro.showToast({
          title: '账号不存在',
          icon: "none"
        })
      })

  }
  const formReset = () => {
    console.log('重置')
  }
  return (
    <View className='container'>
      <View className='title'>同诚快租</View>
      <Form onSubmit={formSubmit} onReset={formReset} >
        <View className='vertical flex-between example-body'>
          <Input className='input-container' name='user' type='text' placeholder='请输入账号' focus maxlength={8} />
          <Input className='input-container' name='password' type='password' placeholder='请输入密码' maxlength={6} />
          <View className='b-box dis-flex flex-between'>
            <Button type='primary' formType='submit'>登陆</Button>
            <Button formType='reset'>重置</Button>
          </View>
        </View>
      </Form>
    </View>
  );
};
export default Index;
