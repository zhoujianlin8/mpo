import React , {Component} from 'react';
import RouteWithSubRoutes from './test.js'
if(process.platform === 'web'){}
export default class App extends Component {
  constructor(props) {
    super(props)
    asasas
  }

  componentWillMount() {
    // 这个组件是专门用来防止类似路由钩子之类的东西的
    window.$route = this.props.history
    if(window.location.pathname === '/') {
      console.log(this.props.history.replace('/home/index'))
    }
  }
  render() {
    return (
      <div className="app-index">
      {/**this.props.routes.map((route, i) => (
         <RouteWithSubRoutes key={i} {...route}/>
         ))**/}
      </div>
  )
  }
}
