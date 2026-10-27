import { Component } from 'react'

// Retain the outgoing view only for its short exit, then release its in-memory props.
export default class PageTransition extends Component {
  state = { page: this.props.page, content: this.props.children }

  static getDerivedStateFromProps(props, state) {
    return props.page === state.page ? { content: props.children } : null
  }

  render() {
    const leaving = this.props.page !== this.state.page
    return <div className={`page-transition ${leaving ? 'page-leaving' : 'page-entering'}`}
      key={this.state.page} data-visible-page={this.state.page} inert={leaving}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === 'page-out') {
          this.setState({ page: this.props.page, content: this.props.children })
        }
      }}>{this.state.content}</div>
  }
}
