import Taro from '@tarojs/taro'
import { Component } from 'react'
import './app.less'

class App extends Component {

  componentDidMount() {
    Taro.cloud.init({
      // env: 'kiry-tools-9g10xwva722883d1',
      env: 'tongchengkuaizu-7g4hhynh201c02cd',
    })
  }

  componentDidShow() { }

  componentDidHide() { }

  componentDidCatchError() { }

  // this.props.children 是将要会渲染的页面
  render() {
    return this.props.children
  }
}

export default App
