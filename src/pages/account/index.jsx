import { useState } from 'react'
import { View, Input, Icon, Button } from '@tarojs/components'
import Taro, {useDidShow, getStorageSync} from '@tarojs/taro'
import './index.less'

const List = () => {
    useDidShow(() => {
        if (!getStorageSync('login')) {
            Taro.showToast({
                title: '未登录',
                duration: 1000,
            })
            setTimeout(() => {
            Taro.redirectTo({
                url: '/pages/index/index',
            })
            }, 1100)
          
        }
    })
    const [name, setName] = useState('')
    // 列表数据
    const [arr, setArr] = useState([])

    // 数据库
    const db = Taro.cloud.database()

    // 账户集合
    const accountList = db.collection('users')

    // 
    const _ = db.command

    // 搜索
    const search = () => {
        console.log('名称:', name)
        Taro.showLoading({
            title: '加载中',
        })
        accountList.where(_.or([{
            user: db.RegExp({
                regexp: '.*' + name,
                options: 'i',
            })
        }
        ])).get({
            success: function (res) {
                console.log(res)
                setArr(res.data)
                Taro.hideLoading()
            }
        })
    }
    // 删除账户信息
    const onRemove = (e, event) => {
        console.log(e._id)
        event.stopPropagation()
        Taro.showModal({
            title: '提示',
            content: '删除后无法找回是否删除?',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                accountList.doc(e._id).remove({
                    success: (removeRes) => {
                        console.log(removeRes)
                        search()
                    }
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
    }
    return (
        <View className='container vertical'>
            <View className='serach-box dis-flex flex-between'>
                <Input type='text' name='name' placeholder='请输入账户' maxlength={11} onInput={e =>
                    setName(e.detail.value)
                }
                />
                <Icon class='icon-small' type='search' size='14' onClick={search} />
            </View>
            {!!arr.length && <View className='list-title'>
                搜索结果
            </View>}
            <View className='list-box vertical'>
                {!!arr.length && arr.map((e, index) =>
                    <View className='card vertical' key={index}>
                        <View className='info'>
                            <View className='dis-flex'>
                                <View className='title'>账户:</View>
                                <View>{e.user}</View>
                            </View>
                            <View className='dis-flex'>
                                <View className='title'>密码:</View>
                                <View>{e.password}</View>
                            </View>
                        </View>
                        <Button type='warn' style='margin: 10px auto;' size='mini' onClick={event => onRemove(e, event)}>删除</Button>
                    </View>
                )}
            </View>
        </View>
    )

}
export default List