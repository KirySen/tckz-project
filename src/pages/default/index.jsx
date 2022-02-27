import Taro, {useDidShow, getStorageSync} from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import './index.less'

const functionality = () => {

    // eslint-disable-next-line react-hooks/rules-of-hooks
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
    const onToAdd = () => {
        Taro.navigateTo({
            url: '/pages/add/index'
        })
    }
    const onToSearch = () => {
        Taro.navigateTo({
            url: '/pages/list/index'
        })
    }
    const onAddUser = () => {
        Taro.navigateTo({
            url: '/pages/addUser/index'
        })
    }
    const onAddAccount = () => {
        Taro.navigateTo({
            url: '/pages/account/index'
        })
    }
    return (
        <View className='vertical container'>
            <Button className='button' onClick={onToAdd}>
                添加公寓信息
            </Button>
            <Button className='button' onClick={onToSearch}>搜索公寓</Button>
            {getStorageSync('role') === 1 && <Button className='button' onClick={onAddUser}>添加账号</Button>}
            {getStorageSync('role') === 1 && <Button className='button' onClick={onAddAccount}>账户管理</Button>}
        </View>
    )
}
export default functionality
