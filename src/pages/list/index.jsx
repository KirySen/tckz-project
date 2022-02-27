import { useState, useEffect } from 'react'
import { ScrollView, View, Input, Icon, Image, Video, Button } from '@tarojs/components'
import Taro, { useDidShow, getStorageSync } from '@tarojs/taro'
import './index.less'

 // 页码
let page = 0

const List = () => {
    // 最多条数
    const MAX_LIMIT = 10
    // 搜索字段
    const [name, setName] = useState('')
    // 列表数据
    const [arr, setArr] = useState([])
    // 集合数据的总条数
    const [totalCount, setTotalCount] = useState(0)
    // 数据库
    const db = Taro.cloud.database()

    // 公寓集合
    const houstList = db.collection('house-list')

    //
    const _ = db.command

    // 获取总条数
    const getTotalCount = () => {
        houstList.count({
            success: function (res) {
                console.log(res)
                setTotalCount(res.total)
            }
        })
    }

    // 搜索
    const search = () => {
        Taro.showLoading({
            title: '加载中',
        })
        houstList.where(_.or([{
            name: db.RegExp({
                regexp: '.*' + name,
                options: 'i',
            })
        }
        ]))
            .skip(0)
            .limit(MAX_LIMIT)
            .get({
                success: function (res) {
                    res.data.map((item) => item.isPlayVideo = false)
                    setArr(res.data)
                    Taro.hideLoading()
                }
            })
        houstList.where(_.or([{
            name: db.RegExp({
                regexp: '.*' + name,
                options: 'i',
            })
        }
        ])).count({
            success: function (res) {
                setTotalCount(res.total)
                console.log(res.total,page)
                if (arr.length < res.total) {
                    page++
                } else {
                    page = 1
                }
            }
        })
    }
    // 预览图片
    const previewImage = (e) => {
        Taro.previewImage({
            urls: [e], // 当前显示图片的http链接
        })
    }
    // 删除公寓信息
    const onRemove = (e, event) => {
        event.stopPropagation()
        Taro.showModal({
            title: '提示',
            content: '删除后无法找回是否删除?',
            success: function (res) {
              if (res.confirm) {
                houstList.doc(e._id).remove({
                    success: () => {
                        search()
                    }
                })
              } else if (res.cancel) {
              }
            }
          })
    }
    // 下载视频
    const onDownloadVideo = ({video}) => {
        // Taro.getSetting({
            // success(set_res) {
            //   if (!set_res.authSetting['scope.writePhotosAlbum']) {
            //     Taro.authorize({
            //       scope: 'scope.writePhotosAlbum',
            //       success () {
                   const task =  Taro.cloud.downloadFile({
                        fileID:video,
                        success: cloud_succ => {
                          // get temp file path
                          // 自定义 文件名称
                                    Taro.saveVideoToPhotosAlbum({
                                filePath: cloud_succ.tempFilePath,
                                success:() => {
                                    Taro.showToast({
                                    title: '下载成功',
                                    icon: 'success',
                                    })
                                },
                                complete() {
                                }
                                })
                            }
                        })

                    task.onProgressUpdate(onProgress)

                //   }
        //         })
        //       }
        //     }
        //   })

      }
    // 提示下载进度
     const onProgress = (res) => {
        Taro.showToast({
          icon:'loading',
          mask:true,
          title: res.progress + "%"
        })
     }
    // 加载后执行
    useDidShow(() => {
        getTotalCount()
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
    // 页面上拉触底事件的处理函数
    const onScrollToLower = () => {
        if (arr.length < totalCount) {
        houstList.where(_.or([{
            name: db.RegExp({
                regexp: '.*' + name,
                options: 'i',
            })
        }]))
            .skip(page * MAX_LIMIT)
            .limit(MAX_LIMIT)
            .get({
                success: res => {
                    page++
                    let newArr = arr.concat(res.data)
                    setArr(newArr)
                },
                fail: () => {

                }
                })
            } else {
            Taro.showToast({
                title: '没有更多数据了',
                icon: 'none'
            })
            }
    }
    // 点击是否播放视频
    const onPlayVideo = (item, index) => {
        let clone_houstList = JSON.parse(JSON.stringify(arr))
        if (!item.isPlayVideo) {
            clone_houstList[index].isPlayVideo = !clone_houstList[index].isPlayVideo
            setArr(clone_houstList)
        }
    }
    useEffect(() => {
        console.log('arr: ', arr, 'page: ', page)
    },[arr])
    return (
        <ScrollView scrollY className='container vertical' onScrollToLower={onScrollToLower}>
            <View className='serach-box dis-flex flex-between'>
                <Input type='text' name='name' placeholder='请输入公寓名称' maxlength={20} onInput={e =>
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
                        {!e.isPlayVideo ? <Image className='video-poster' src={e.cover || 'cloud://tongchengkuaizu-7g4hhynh201c02cd.746f-tongchengkuaizu-7g4hhynh201c02cd-1309603707/1645963534476.jpg'}
                          onClick={() => onPlayVideo(e, index)}
                        ><View className='tip'>点击加载视频</View></Image> :
                        <Video
                          src={e.video}
                          style='width: 100%'
                          poster={e.imgArr[0]}
                        />}
                        <View className='info'>
                            <View className='dis-flex'>
                                <View className='title'>公寓名称:</View>
                                <View>{e.name}</View>
                            </View>
                            <View className='dis-flex'>
                                <View className='title'>位置:</View>
                                <View>{e.position}</View>
                            </View>
                            <View className='dis-flex'>
                                <View className='title'>联系方式:</View>
                                <View>{e.phone}</View>
                            </View>
                            <View className='dis-flex'>
                                <View className='title'>户型:</View>
                                <View>{e.type}</View>
                            </View>
                            <View className='dis-flex'>
                                <View className='title'>价格:</View>
                                <View>{e.price}/月</View>
                            </View>
                        </View>
                        {!!e.imgArr.length && e.imgArr.map((img, key) => (
                            <Image src={img} key={key} style='margin-bottom: 5px; width: 100%' show-menu-by-longpress lazy-load onClick={() => previewImage(img)} />
                        ))}
                        {!!e.video && <Button type='primary' style='margin: 10px auto;' size='mini' onClick={() => onDownloadVideo(e)}>保存视频</Button>}
                        <Button type='warn' style='margin: 10px auto;' size='mini' onClick={event => onRemove(e, event)}>删除</Button>
                    </View>
                )}
            </View>
        </ScrollView>
    )

}
export default List
