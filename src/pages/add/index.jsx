import Taro, {useDidShow, getStorageSync} from '@tarojs/taro'
import { useState } from 'react'
import { View, Form, Input, Button, Image, Video, Icon } from '@tarojs/components'
import './index.less'

const Add = () => {
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
    // 视频封面
    const [cover, setCover] = useState('')
    const [imgArr, setImgArr] = useState([])
    const [video, setVideo] = useState('')

    // 数据库
    const db = Taro.cloud.database()
    // 公寓集合
    const houstList = db.collection('house-list')

    const onSubmit = (e) => {

        Taro.showModal({
            title: '提示',
            content: '提交后将无法修改确定提交吗?',
            success: (info) => {

                if (info.confirm) {

                    if (!e.detail.value.name || !e.detail.value.phone || !e.detail.value.position || !e.detail.value.type || !e.detail.value.price) {

                        return Taro.showToast({
                            title: '请填写正确的信息',
                            icon: 'none',
                            duration: 1000
                        })

                    } else {
                        houstList.add({
                        data: {
                            name: e.detail.value.name,
                            phone: e.detail.value.phone,
                            position: e.detail.value.position,
                            type: e.detail.value.type,
                            price: e.detail.value.price,
                            cover,
                            imgArr,
                            video,
                            createTime: parseInt(new Date(Date.now()).valueOf() / 1000)
                        },
                        success: res => {
                            console.log('success: ', res)
                            Taro.redirectTo({
                                url: '/pages/default/index'
                            })
                        },
                        fail: res => {
                            console.log('fail: ', res)
                        }
                    })
                }
                } else if (info.cancel) {
                    console.log('用户点击取消')
                }
            }
        })

    }
     // 选择图片
    const onChooseImage = (event, type) => {
        event.stopPropagation()
        Taro.chooseImage({
            count: 1,
            sizeType: 'compressed',
            sourceType:['album', 'camera'],
            success: res => {
                Taro.showLoading({
                    title: '上传中'
                })
                Taro.cloud.uploadFile({
                    cloudPath: new Date().getTime() + '.jpg',
                    filePath: res.tempFilePaths[0], // 文件路径
                    success: file => {
                        if (type === 'cover') {
                            setCover(file.fileID)
                        } else {
                           let newArr = imgArr.concat(file.fileID)
                        setImgArr(Array.from(new Set(newArr.splice(0, 6))))
                        }
                        Taro.hideLoading()
                    },
                    fail: console.error
                })
            },
            fail: res => {
                console.log('图片上传失败:', res)
            },
        })
    }

    // 选择视频
    const onChooseVideo = () => {
        Taro.chooseVideo({
            sourceType: ['album', 'camera'],
            maxDuration: 60,
            camera: 'back',
            success: (res) => {
                console.log(res)
                Taro.showLoading({
                    title: '上传中',
                    })
                Taro.cloud.uploadFile({
                    cloudPath: new Date().getTime() + '.mp4', // 上传至云端的路径
                    filePath: res.tempFilePath, // 小程序临时文件路径
                    success: videoFile => {
                        setVideo(videoFile.fileID)
                        Taro.hideLoading()
                    },
                    fail: (err) => {
                        Taro.showToast({
                            title: err,
                            icon: 'none',
                            duration:1000
                        })
                    },

                })
            }
        })
    }

    const deleteImg = (e, index) => {
        e.stopPropagation()
        let copyArr = JSON.parse(JSON.stringify(imgArr))
        copyArr.splice(index, 1)
        setImgArr(copyArr)
    }
    return (
        <View className='container'>
            <Form onSubmit={onSubmit}>
                <View className='vertical'>
                    <View className='form-item'>
                        <View className='label-title'>公寓名称</View>
                        <Input className='label-title' name='name' type='text' placeholder='请输入公寓名称' />
                    </View>
                    <View className='form-item'>
                        <View className='label-title'>联系方式</View>
                        <Input className='label-title' name='phone' type='number' placeholder='请输入联系方式' />
                    </View>
                    <View className='form-item'>
                        <View className='label-title'>位置</View>
                        <Input className='label-title' name='position' type='text' placeholder='请输入位置' />
                    </View>
                    <View className='form-item'>
                        <View className='label-title'>户型</View>
                        <Input className='label-title' name='type' type='text' placeholder='请输入户型' />
                    </View>
                    <View className='form-item'>
                        <View className='label-title'>价格</View>
                        <Input className='label-title' name='price' type='number' placeholder='请输入价格' />
                    </View>
                    <View className='form-item'>
                        <View className='label-title'>视频封面</View>
                        <View className='dis-wrap'>
                            {!!cover &&
                                        <Image className='media' src={cover}>
                                        <Icon className='delete' type='clear' onClick={(event) => {
                                            event.stopPropagation()
                                            setCover('')
                                            }}
                                        />
                                        </Image>
                                }
                                {!cover && <View className='media' onClick={e => onChooseImage(e, 'cover')}>
                                    <View className='icon'>+</View>
                                </View>}
                        </View>
                    </View>
                    <View className='form-item'>
                        <View className='label-title'>图片</View>
                        <View className='dis-wrap'>
                            {!!imgArr.length && imgArr.map((e, index) =>
                                    <Image className='media' src={e} key={index} >
                                        <Icon className='delete' type='clear' onClick={(event) => deleteImg(event, index)} />
                                    </Image>
                            )}
                            {imgArr.length < 6 && <View className='media' onClick={e => onChooseImage(e, 'img')}>
                                <View className='icon'>+</View>
                            </View>}
                        </View>
                    </View>
                    <View className='form-item'>
                        <View className='label-title'>视频</View>
                        {!!video && <Video id='video'
                          src={video}
                          style='width: 100%'
                          initialTime='0'
                          controls
                          autoplay={false}
                          loop={false}
                          muted={false}
                        />}
                        {!video && <View className='media' onClick={onChooseVideo}>
                            <View className='icon'>+</View>
                        </View>}
                        {!!video &&<Button type='warn' size='mini' style='margin: 20px 0' onClick={() => setVideo('')}>重新上传</Button>}
                    </View>
                </View>
                <Button formType='submit' type='primary' onClick={onSubmit}>提交</Button>
            </Form>
        </View>

    )
}
export default Add
